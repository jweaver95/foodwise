"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { Barcode, ImageSquare, X } from "@phosphor-icons/react/dist/ssr";
import { ProductPhoto } from "@/components/ProductPhoto";
import { Button, Screen } from "@/components/ui";
import { useHousehold } from "@/context/HouseholdContext";
import { normalizeBarcode } from "@/lib/barcode";
import { PRODUCTS, SAMPLE_SCAN_ORDER } from "@/lib/data";
import { panelReadingQuality } from "@/lib/panelText";
import { rememberProduct } from "@/lib/productCache";
import { readIngredientPanel } from "@/lib/readPanel";
import type { Product } from "@/lib/types";

type Mode = "barcode" | "ocr";
type Phase = "idle" | "live" | "reading" | "review";

const TYPE_IN_AFTER_MS = 20_000;

const SAMPLES = SAMPLE_SCAN_ORDER.map(
  (id) => PRODUCTS.find((product) => product.id === id)!,
);

const REAR_CAMERA: MediaStreamConstraints = {
  audio: false,
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
};

function cameraErrorMessage(): string {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "The camera needs a secure page. Open the Vercel link, or localhost.";
  }
  return "The camera is unavailable. Allow camera access, or take a photo instead.";
}

export default function ScanPage() {
  const router = useRouter();
  const { selectedMember } = useHousehold();
  const [mode, setMode] = useState<Mode>("barcode");
  const [phase, setPhase] = useState<Phase>("idle");
  const [picking, setPicking] = useState(false);
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [shot, setShot] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [typeIn, setTypeIn] = useState(false);
  const [typed, setTyped] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoNode, setVideoNode] = useState<HTMLVideoElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const alive = useRef(true);

  const setVideo = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoNode(node);
  }, []);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const lookup = useCallback(async (barcode: string) => {
    setPhase("reading");
    setMessage(null);
    try {
      const response = await fetch(`/api/lookup?barcode=${encodeURIComponent(barcode)}`);
      const body = (await response.json()) as { product?: Product; error?: string };
      if (!alive.current) return;
      if (!response.ok || !body.product) {
        setMessage(body.error ?? "No product was found for that barcode.");
        setPhase("live");
        return;
      }
      rememberProduct(body.product);
      router.push(`/verdict/${body.product.id}`);
    } catch {
      if (!alive.current) return;
      setMessage("The lookup failed. Check the connection and try again.");
      setPhase("live");
    }
  }, [router]);

  useEffect(() => {
    if (mode !== "barcode" || phase !== "live" || !videoNode) return;
    const video = videoNode;

    let stopped = false;
    let controls: IScannerControls | undefined;
    const reader = new BrowserMultiFormatReader();

    void reader
      .decodeFromConstraints(REAR_CAMERA, video, (result) => {
        if (stopped || !result) return;
        const code = result.getText().replace(/\D/g, "");
        if (code.length < 8 || code.length > 14) return;
        stopped = true;
        controls?.stop();
        void lookup(code);
      })
      .then((next) => {
        controls = next;
        if (stopped) next.stop();
      })
      .catch(() => {
        if (stopped) return;
        setCameraBlocked(true);
        setPhase("idle");
        setMessage(cameraErrorMessage());
      });

    return () => {
      stopped = true;
      controls?.stop();
    };
  }, [mode, phase, lookup, videoNode]);

  useEffect(() => {
    if (mode !== "barcode" || phase !== "live" || typeIn) return;
    const timer = window.setTimeout(() => setTypeIn(true), TYPE_IN_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [mode, phase, typeIn]);

  useEffect(() => {
    if (mode !== "ocr" || phase !== "live" || !videoNode) return;
    const video = videoNode;

    let cancelled = false;
    let stream: MediaStream | undefined;

    void Promise.resolve()
      .then(() => {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera unavailable");
        }
        return navigator.mediaDevices.getUserMedia(REAR_CAMERA);
      })
      .then((next) => {
        if (cancelled) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = next;
        video.srcObject = next;
        return video.play();
      })
      .catch(() => {
        if (cancelled) return;
        setCameraBlocked(true);
        setPhase("idle");
        setMessage(cameraErrorMessage());
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
  }, [mode, phase, videoNode]);

  const recognize = useCallback(async (image: string) => {
    try {
      const reading = await readIngredientPanel(image);
      if (!alive.current) return;
      const quality = panelReadingQuality(reading.text, reading.confidence);
      if (quality === "empty") {
        setShot(null);
        setPhase(cameraBlocked ? "idle" : "live");
        setMessage("The ingredient list was not readable. Fill the frame with the panel and retake.");
        return;
      }
      setDraft(reading.text);
      setUncertain(quality === "uncertain");
      setPhase("review");
    } catch {
      if (!alive.current) return;
      setPhase(cameraBlocked ? "idle" : "live");
      setMessage("The panel could not be read. Try again in brighter light.");
    }
  }, [cameraBlocked]);

  function capturePanel() {
    const video = videoRef.current;
    const image = video ? captureFrame(video, 1600, 0.92) : null;
    if (!image) {
      setMessage("The camera is still starting. Hold steady and try again.");
      return;
    }
    setShot(image);
    setMessage(null);
    setPhase("reading");
    void recognize(image);
  }

  async function confirmPanel() {
    setPhase("reading");
    setMessage(null);
    try {
      const response = await fetch("/api/panel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft }),
      });
      const body = (await response.json()) as { product?: Product; error?: string };
      if (!alive.current) return;
      if (!response.ok || !body.product) {
        setMessage(body.error ?? "That panel could not be checked.");
        setPhase("review");
        return;
      }
      const image = shot ? await shrinkDataUrl(shot) : body.product.image;
      rememberProduct({ ...body.product, image });
      router.push(`/verdict/${body.product.id}`);
    } catch {
      if (!alive.current) return;
      setMessage("The check failed. Check the connection and try again.");
      setPhase("review");
    }
  }

  async function onPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setMessage(null);
    setPicking(false);

    if (mode === "barcode") {
      setPhase("reading");
      const url = URL.createObjectURL(file);
      try {
        const reader = new BrowserMultiFormatReader();
        const result = await reader.decodeFromImageUrl(url);
        if (!alive.current) return;
        await lookup(result.getText());
      } catch {
        if (!alive.current) return;
        setPhase("idle");
        setMessage("No barcode was readable in that photo.");
      } finally {
        URL.revokeObjectURL(url);
      }
      return;
    }

    const image = await fileToDataUrl(file);
    if (!alive.current) return;
    setShot(image);
    setPhase("reading");
    void recognize(image);
  }

  function selectMode(next: Mode) {
    setMode(next);
    setPhase("idle");
    setPicking(false);
    setMessage(null);
    setShot(null);
    setDraft("");
    setUncertain(false);
    setTypeIn(false);
    setTyped("");
  }

  function submitTypedBarcode() {
    const read = normalizeBarcode(typed);
    if (!read.ok) {
      setMessage("That number is not a complete barcode. Check the digits under the bars.");
      return;
    }
    void lookup(read.barcode);
  }

  const reviewing = phase === "review";
  const reading = phase === "reading";

  return (
    <Screen tone="dark">
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_35%,#243028_0%,#0d120f_72%)]" />

        <div className="relative flex min-h-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center justify-between px-5 pt-5">
            <button
              type="button"
              onClick={() => router.push("/home")}
              aria-label="Close scanner"
              className="-ml-2 flex size-11 items-center justify-center rounded-full bg-white/8 text-white active:scale-95"
            >
              <X size={24} weight="bold" />
            </button>
            <p className="rounded-full bg-white/12 px-4 py-2 text-[13px] font-medium text-white">
              Scanning for {selectedMember?.name ?? "your household"}
            </p>
          </header>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-6">
            {reviewing ? (
              <div className="w-full">
                {shot ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={shot}
                    alt="Ingredient panel you photographed"
                    className="h-36 w-full rounded-[20px] object-cover"
                  />
                ) : null}
                <label htmlFor="panel-reading" className="mt-5 block text-[20px] font-semibold tracking-[-0.02em] text-white">
                  Check the reading
                </label>
                <p className="mt-2 text-[13px] leading-relaxed text-white/55">
                  {message ??
                    (uncertain
                      ? "This reading looks uncertain. Correct it against the package, or retake."
                      : "Correct anything the camera misread. If the product is not found, it stays unknown.")}
                </p>
                <textarea
                  id="panel-reading"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={6}
                  className="mt-4 w-full resize-none rounded-[20px] bg-white/10 px-4 py-3 text-[15px] leading-relaxed text-white outline-none ring-1 ring-white/15"
                />
              </div>
            ) : (
              <>
                <div
                  className={`relative ${
                    mode === "barcode" ? "size-[228px]" : "h-[340px] w-full max-w-[300px]"
                  }`}
                >
                  {[
                    "left-0 top-0 border-l-2 border-t-2 rounded-tl-[16px]",
                    "right-0 top-0 border-r-2 border-t-2 rounded-tr-[16px]",
                    "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-[16px]",
                    "right-0 bottom-0 border-r-2 border-b-2 rounded-br-[16px]",
                  ].map((corner) => (
                    <span
                      key={corner}
                      className={`absolute size-14 border-white/85 ${corner}`}
                    />
                  ))}
                  {phase === "live" ? (
                    <video
                      ref={setVideo}
                      className={`absolute inset-3 size-[calc(100%-1.5rem)] rounded-[12px] ${
                        mode === "ocr" ? "object-contain" : "object-cover"
                      }`}
                      muted
                      autoPlay
                      playsInline
                    />
                  ) : null}
                  {reading ? null : (
                    <span className="scanline absolute left-8 right-8 top-1/2 h-px bg-white/70" />
                  )}
                  {reading ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-viewfinder/55 text-center text-[15px] font-medium text-white">
                      {mode === "barcode" ? "Looking up the product…" : "Reading the panel…"}
                    </span>
                  ) : null}
                </div>

                <p className="mt-10 text-center text-[20px] font-semibold tracking-[-0.02em] text-white">
                  {reading
                    ? mode === "barcode"
                      ? "Looking up the product"
                      : "Reading the panel"
                    : mode === "barcode"
                      ? "Hold over the barcode"
                      : "Fill the frame with the panel"}
                </p>
                <p className="mt-2 max-w-[32ch] text-center text-[13px] leading-relaxed text-white/55">
                  {message ??
                    (mode === "barcode"
                      ? typeIn
                        ? "The bars are still hard to catch. Type the number printed under them."
                        : "Point the rear camera at a barcode. Unknown ingredients stay unknown."
                      : "Photograph the ingredient list, not the front of the package. You confirm the words before a verdict.")}
                </p>
              </>
            )}
          </div>

          <div className="shrink-0 px-5 pb-6">
            {reviewing ? null : (
              <div className="mb-4 flex rounded-full bg-white/10 p-1">
                {(
                  [
                    { id: "barcode" as Mode, label: "Barcode", Icon: Barcode },
                    { id: "ocr" as Mode, label: "Panel photo", Icon: ImageSquare },
                  ]
                ).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => selectMode(id)}
                    aria-pressed={mode === id}
                    className={`flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-full text-[14px] font-semibold transition-colors ${
                      mode === id ? "bg-white text-viewfinder" : "text-white/70"
                    }`}
                  >
                    <Icon size={17} />
                    {label}
                  </button>
                ))}
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              tabIndex={-1}
              aria-hidden="true"
              className="sr-only"
              onChange={(event) => void onPhoto(event)}
            />

            {picking ? (
              <div className="max-h-[280px] space-y-2 overflow-y-auto">
                <p className="px-1 pb-1 text-[13px] font-medium text-white/55">
                  Pick a sample from the aisle
                </p>
                {SAMPLES.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => router.push(`/verdict/${product.id}`)}
                    className="flex w-full items-center gap-3 rounded-[20px] bg-white/10 p-2 pr-4 text-left active:scale-[0.99]"
                  >
                    <ProductPhoto
                      src={product.image}
                      alt=""
                      className="size-14 shrink-0 rounded-[14px]"
                      sizes="56px"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-white">
                        {product.name}
                      </span>
                      <span className="mt-0.5 block text-[12px] text-white/55">
                        {product.capture === "ocr" ? "No barcode match" : product.brand}
                      </span>
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPicking(false)}
                  className="w-full py-3 text-[14px] font-medium text-white/60"
                >
                  Cancel
                </button>
              </div>
            ) : reviewing ? (
              <>
                <Button tone="light" disabled={reading || draft.trim().length < 8} onClick={() => void confirmPanel()}>
                  Check this panel
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setPhase("live");
                    setMessage(null);
                    setShot(null);
                  }}
                  className="mt-3 w-full py-2 text-center text-[14px] font-medium text-white/70"
                >
                  Retake
                </button>
              </>
            ) : (
              <>
                {mode === "barcode" && typeIn && !reading ? (
                  <form
                    className="mb-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      submitTypedBarcode();
                    }}
                  >
                    <label htmlFor="typed-barcode" className="block text-[14px] font-semibold text-white">
                      Type the barcode
                    </label>
                    <input
                      id="typed-barcode"
                      value={typed}
                      inputMode="numeric"
                      autoComplete="off"
                      enterKeyHint="search"
                      placeholder="Digits under the bars"
                      onChange={(event) => {
                        setTyped(event.target.value.replace(/\D/g, "").slice(0, 14));
                        setMessage(null);
                      }}
                      className="mt-2 w-full rounded-full bg-white/10 px-5 py-3.5 text-center font-mono text-[18px] tracking-[0.08em] text-white outline-none ring-1 ring-white/15 placeholder:text-white/35"
                    />
                    <Button
                      type="submit"
                      tone="light"
                      className="mt-3"
                      disabled={typed.length < 8}
                    >
                      Look up this barcode
                    </Button>
                  </form>
                ) : null}
                {mode === "barcode" ? (
                  <Button
                    tone="light"
                    disabled={phase === "live" || reading}
                    onClick={() => {
                      setPicking(false);
                      setMessage(null);
                      setPhase("live");
                    }}
                  >
                    {reading ? "Looking up the product…" : phase === "live" ? "Looking for a barcode…" : "Scan a barcode"}
                  </Button>
                ) : (
                  <Button
                    tone="light"
                    disabled={reading}
                    onClick={() => {
                      setPicking(false);
                      setMessage(null);
                      if (phase === "live") capturePanel();
                      else setPhase("live");
                    }}
                  >
                    {reading ? "Reading the panel…" : phase === "live" ? "Capture panel" : "Open camera"}
                  </Button>
                )}
                {cameraBlocked ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-3 w-full py-2 text-center text-[14px] font-medium text-white/70"
                  >
                    {mode === "barcode" ? "Photograph a barcode" : "Take a panel photo"}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    setPhase("idle");
                    setPicking(true);
                  }}
                  className="mt-3 w-full py-2 text-center text-[14px] font-medium text-white/70"
                >
                  Use a sample product
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Screen>
  );
}

function captureFrame(video: HTMLVideoElement, maxEdge: number, quality: number): string | null {
  if (!video.videoWidth || !video.videoHeight) return null;
  const scale = Math.min(1, maxEdge / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

function shrinkDataUrl(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const max = 480;
      const scale = Math.min(1, max / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        resolve("/photos/welcome.png");
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => resolve("/photos/welcome.png");
    image.src = dataUrl;
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
