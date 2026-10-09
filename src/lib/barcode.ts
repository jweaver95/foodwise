/** GTIN check digit. A 12-digit UPC-A is padded to 13 so it matches EAN storage. */

export type BarcodeRead =
  | { ok: true; barcode: string }
  | { ok: false; error: string };

export function normalizeBarcode(raw: string): BarcodeRead {
  const digits = raw.replace(/\D/g, "");
  const padded = digits.length === 12 ? `0${digits}` : digits;

  if (![8, 13, 14].includes(padded.length)) {
    return { ok: false, error: "Couldn't read that barcode. Try again." };
  }

  if (!hasValidCheckDigit(padded)) {
    return { ok: false, error: "Couldn't read that barcode. Try again." };
  }

  return { ok: true, barcode: padded };
}

export function barcodeCandidates(barcode: string): string[] {
  const candidates = [barcode];
  if (barcode.length === 13 && barcode.startsWith("0")) {
    candidates.push(barcode.slice(1));
  }
  return candidates;
}

function hasValidCheckDigit(code: string): boolean {
  const digits = code.split("").map((digit) => Number(digit));
  const check = digits.pop();
  if (check == null) return false;
  let sum = 0;
  digits.reverse().forEach((digit, index) => {
    sum += digit * (index % 2 === 0 ? 3 : 1);
  });
  return (10 - (sum % 10)) % 10 === check;
}
