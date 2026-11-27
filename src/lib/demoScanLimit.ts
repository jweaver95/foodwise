import type { HouseholdState } from "./types";

/** Demo guests get this many completed DB lookups before signup is required. */
export const DEMO_SCAN_LIMIT = 5;

const STORAGE_KEY = "foodwise-demo-db-scans-v1";
const COOKIE_NAME = "fw_demo_db_scans";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 400; // ~13 months

/**
 * Persistence choice: dual-write localStorage + a first-party cookie, read the
 * higher of the two. There is no anonymous server identity for the aisle demo.
 * Clearing only the page or only one store does not fully reset the gate;
 * wiping all site data still can. Household "Reset this demo" does not clear
 * this counter on purpose — otherwise free DB scans would refill forever.
 */

function clampCount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), DEMO_SCAN_LIMIT);
}

function readCookie(): number {
  if (typeof document === "undefined") return 0;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!match) return 0;
  return clampCount(decodeURIComponent(match.slice(COOKIE_NAME.length + 1)));
}

function writeCookie(count: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(String(count))}; Max-Age=${COOKIE_MAX_AGE_SEC}; Path=/; SameSite=Lax`;
}

function readStorage(): number {
  if (typeof window === "undefined") return 0;
  try {
    return clampCount(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return 0;
  }
}

function writeStorage(count: number) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(count));
  } catch {
    // Private-mode storage failures still leave the cookie copy.
  }
}

/** True only for the sample household — signed-in and local profiles are uncapped. */
export function demoScanLimitApplies(source: HouseholdState["source"]): boolean {
  return source === "demo";
}

export function getDemoDbScanCount(): number {
  return Math.max(readStorage(), readCookie());
}

export function demoDbScansRemaining(): number {
  return Math.max(0, DEMO_SCAN_LIMIT - getDemoDbScanCount());
}

export function isDemoDbScanLimitReached(): boolean {
  return getDemoDbScanCount() >= DEMO_SCAN_LIMIT;
}

/** Record one completed product lookup/panel check that hit the real catalog DB. */
export function recordDemoDbScan(): number {
  const next = Math.min(DEMO_SCAN_LIMIT, getDemoDbScanCount() + 1);
  writeStorage(next);
  writeCookie(next);
  return next;
}
