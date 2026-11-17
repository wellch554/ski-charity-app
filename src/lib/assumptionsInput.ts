// Pure helpers between the Assumptions form and the calc layer: parsing and
// validating what the user types, % conversion, and localStorage read/write.
// No React here, so all of it is unit-tested in assumptionsInput.test.ts.
import { type Assumptions, DEFAULT_ASSUMPTIONS } from "../calc/defaults";
import { type FieldKind, ALL_FIELDS } from "./assumptionFields";

// --- Percentages ---------------------------------------------------------

export function percentToDecimal(percent: number): number {
  return percent / 100;
}

export function decimalToPercent(decimal: number): number {
  // 0.07 * 100 is 7.000000000000001 in floating point. Trimming to 12
  // significant digits removes that noise. Display only: never fed back into
  // calculations.
  return Number((decimal * 100).toPrecision(12));
}

/** The text a field starts with, e.g. 0.1 → "10" for a percent field. */
export function formatFieldValue(value: number, kind: FieldKind): string {
  return String(kind === "percent" ? decimalToPercent(value) : value);
}

// --- Parsing and validation ----------------------------------------------

export type ParseResult =
  { ok: true; value: number } | { ok: false; error: string };

// A plain decimal like "21", "62.5" or "-3". Deliberately rejects things
// Number()/parseFloat() would accept: "1e3", "12abc" (parseFloat → 12), "".
const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/;

/** Turn the text in a field into the value stored in Assumptions. */
export function parseField(text: string, kind: FieldKind): ParseResult {
  const trimmed = text.trim();
  if (!PLAIN_NUMBER.test(trimmed))
    return { ok: false, error: "Enter a number" };

  const n = Number(trimmed);
  if (n < 0) return { ok: false, error: "Can't be negative" };
  if (kind === "count" && !Number.isInteger(n)) {
    return { ok: false, error: "Must be a whole number" };
  }
  return { ok: true, value: kind === "percent" ? percentToDecimal(n) : n };
}

/** Same rules as parseField, for a value that is already stored. */
function isValidStoredValue(value: unknown, kind: FieldKind): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= 0 &&
    (kind !== "count" || Number.isInteger(value))
  );
}

// --- localStorage --------------------------------------------------------

// Bump the version if the shape of Assumptions changes incompatibly.
export const STORAGE_KEY = "ski-cost-model:assumptions:v1";

// Just the parts of window.localStorage we use, so tests can pass a fake.
export type KeyValueStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

/**
 * Any value (e.g. parsed JSON) turned into valid Assumptions: valid fields
 * are kept, anything missing, unknown or invalid falls back to the default.
 * Used for the saved form inputs and for each saved scenario.
 */
export function sanitizeAssumptions(value: unknown): Assumptions {
  const result = { ...DEFAULT_ASSUMPTIONS };
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return result;
  }
  const record = value as Record<string, unknown>;
  for (const { key, kind } of ALL_FIELDS) {
    const field = record[key];
    if (isValidStoredValue(field, kind)) result[key] = field;
  }
  return result;
}

/**
 * Saved assumptions, merged over the defaults field by field, so a corrupt
 * or outdated saved value can never break the page.
 */
export function loadAssumptions(storage: KeyValueStorage): Assumptions {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return sanitizeAssumptions(raw === null ? null : JSON.parse(raw));
  } catch {
    // Storage blocked (e.g. private mode) or corrupt JSON.
    return { ...DEFAULT_ASSUMPTIONS };
  }
}

export function saveAssumptions(storage: KeyValueStorage, a: Assumptions) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(a));
  } catch {
    // Not saving is better than crashing; the page still works.
  }
}

export function clearAssumptions(storage: KeyValueStorage) {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // See saveAssumptions.
  }
}
