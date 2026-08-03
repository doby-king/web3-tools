import { formatUnits, parseUnits } from "ethers";

/** Upper bound for user-provided decimals (custom tab) */
export const MAX_DECIMALS = 36;

/** Accepts "", integers and decimals like "1.5"; rejects signs, exponents, etc. */
const AMOUNT_RE = /^\d*\.?\d*$/;
const RAW_RE = /^\d+$/;

/**
 * Convert a human-readable amount (e.g. "1.5" ETH) into base units ("1500000000000000000" wei).
 * Uses BigInt via ethers parseUnits — never floating point.
 * Returns null when the input is invalid or the fraction exceeds the given decimals.
 */
export function toBaseUnits(display: string, decimals: number): string | null {
  if (!AMOUNT_RE.test(display)) return null;
  const fraction = display.split(".")[1];
  if (fraction && fraction.length > decimals) return null;
  try {
    return parseUnits(display, decimals).toString();
  } catch {
    return null;
  }
}

/**
 * Convert base units (e.g. "1500000000000000000" wei) into a human-readable amount ("1.5").
 * Returns null when the input is not a non-negative integer string.
 */
export function fromBaseUnits(raw: string, decimals: number): string | null {
  if (!RAW_RE.test(raw)) return null;
  try {
    return formatUnits(raw, decimals);
  } catch {
    return null;
  }
}

/** Validates the custom decimals input: integer within [0, MAX_DECIMALS] */
export function isValidDecimals(input: string): boolean {
  if (!RAW_RE.test(input)) return false;
  const value = Number(input);
  return value >= 0 && value <= MAX_DECIMALS;
}
