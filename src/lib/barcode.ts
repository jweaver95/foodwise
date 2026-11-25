/**
 * Same item, two writings: a 12-digit UPC and that number with one leading 0.
 * Any other barcode is an exact match. A different quantity is a different number.
 */

const UNREADABLE = "Couldn't read that barcode. Try again.";

export type BarcodeRead =
  | { ok: true; barcode: string }
  | { ok: false; error: string };

export type BarcodeMatch =
  | { ok: true; scanned: string; canonical: string; candidates: string[] }
  | { ok: false; error: string };

export function matchBarcode(raw: string): BarcodeMatch {
  const scanned = raw.replace(/\D/g, "");
  const canonical = scanned.length === 12 ? `0${scanned}` : scanned;

  if (![8, 13, 14].includes(canonical.length) || !hasValidCheckDigit(canonical)) {
    return { ok: false, error: UNREADABLE };
  }

  const candidates = [scanned];
  if (scanned.length === 12) candidates.push(canonical);
  else if (scanned.length === 13 && scanned.startsWith("0")) candidates.push(scanned.slice(1));

  return { ok: true, scanned, canonical, candidates };
}

export function normalizeBarcode(raw: string): BarcodeRead {
  const match = matchBarcode(raw);
  if (!match.ok) return match;
  return { ok: true, barcode: match.canonical };
}

export function barcodeCandidates(barcode: string): string[] {
  const match = matchBarcode(barcode);
  return match.ok ? match.candidates : [barcode];
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
