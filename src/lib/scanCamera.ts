/** Retail formats FoodWise looks up. QR and other codes are ignored. */
const RETAIL_FORMATS = ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"];

export const OPEN_CAMERA: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    frameRate: { ideal: 30 },
  },
};

type CameraChoice = {
  kind: string;
  deviceId: string;
  label: string;
};

type DetectedBarcode = { rawValue?: string };

type BarcodeDetectorInstance = {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>;
};

type BarcodeDetectorConstructor = {
  new (options?: { formats?: string[] }): BarcodeDetectorInstance;
  getSupportedFormats: () => Promise<string[]>;
};

function detectorConstructor(): BarcodeDetectorConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  const candidate = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
  if (!candidate?.getSupportedFormats) return undefined;
  return candidate;
}

export function isAndroidDevice(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

function cameraIndex(label: string): number {
  const match = label.match(/camera(?:2)?\s*(\d+)/i);
  return match ? Number(match[1]) : 50;
}

function isSpecialLens(label: string): boolean {
  return /ultra[\s-]?wide|telephoto|\btele\b|depth|infrared/i.test(label);
}

/** Prefer the main rear camera when the device lists more than one. */
export function pickRearCamera(devices: CameraChoice[]): string | undefined {
  const videos = devices.filter((device) => device.kind === "videoinput" && device.deviceId);
  if (videos.length < 2 || videos.every((device) => !device.label)) return undefined;

  const rear = videos.filter(
    (device) => /back|rear|environment/i.test(device.label) && !/front|user|facetime/i.test(device.label),
  );
  if (rear.length === 0) return undefined;

  return [...rear].sort((a, b) => {
    const special = Number(isSpecialLens(a.label)) - Number(isSpecialLens(b.label));
    if (special !== 0) return special;
    return cameraIndex(a.label) - cameraIndex(b.label);
  })[0]?.deviceId;
}

export function constraintsForDevice(deviceId?: string): MediaStreamConstraints {
  if (!deviceId) return OPEN_CAMERA;
  return {
    audio: false,
    video: {
      deviceId: { exact: deviceId },
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 },
    },
  };
}

export function retailDigits(raw: string | undefined): string | null {
  const digits = raw?.replace(/\D/g, "") ?? "";
  if (digits.length < 8 || digits.length > 14) return null;
  return digits;
}

async function sharpenCamera(stream: MediaStream): Promise<void> {
  const track = stream.getVideoTracks()[0];
  const caps = track?.getCapabilities?.() as MediaTrackCapabilities & { focusMode?: string[] };
  if (!caps?.focusMode?.includes("continuous")) return;
  try {
    await track.applyConstraints({
      advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
    });
  } catch {
    // The camera keeps whatever focus it already has.
  }
}

/**
 * Opens the rear camera at 1080p when the device can do that.
 * A single webcam, or a phone whose rear camera is already selected, stays on the first stream.
 */
export async function openScanStream(): Promise<MediaStream> {
  const media = navigator.mediaDevices;
  if (!media?.getUserMedia) throw new Error("Camera unavailable");

  const listed = (await media.enumerateDevices?.().catch(() => [])) ?? [];
  const known = pickRearCamera(listed);
  if (known) {
    try {
      const stream = await media.getUserMedia(constraintsForDevice(known));
      await sharpenCamera(stream);
      return stream;
    } catch {
      // The saved camera id can go stale. Ask for the rear camera by facing instead.
    }
  }

  const stream = await media.getUserMedia(OPEN_CAMERA);
  await sharpenCamera(stream);

  const labeled = (await media.enumerateDevices?.().catch(() => [])) ?? [];
  const rearId = pickRearCamera(labeled);
  const currentId = stream.getVideoTracks()[0]?.getSettings?.().deviceId;
  if (!rearId || rearId === currentId) return stream;

  try {
    const rear = await media.getUserMedia(constraintsForDevice(rearId));
    stream.getTracks().forEach((track) => track.stop());
    await sharpenCamera(rear);
    return rear;
  } catch {
    return stream;
  }
}

/** Google's on-device scanner, only on Android and only when the browser can actually use it. */
export async function createAndroidDetector(
  userAgent = typeof navigator === "undefined" ? "" : navigator.userAgent,
): Promise<BarcodeDetectorInstance | null> {
  if (!isAndroidDevice(userAgent)) return null;
  const Detector = detectorConstructor();
  if (!Detector) return null;
  try {
    const supported = await Detector.getSupportedFormats();
    const formats = RETAIL_FORMATS.filter((format) => supported.includes(format));
    if (formats.length === 0) return null;
    return new Detector({ formats });
  } catch {
    return null;
  }
}

export async function detectStillBarcode(source: CanvasImageSource): Promise<string | null> {
  const detector = await createAndroidDetector();
  if (!detector) return null;
  try {
    const codes = await detector.detect(source);
    return codes.map((code) => retailDigits(code.rawValue)).find((digits): digits is string => Boolean(digits)) ?? null;
  } catch {
    return null;
  }
}
