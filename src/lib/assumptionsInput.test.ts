import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS } from "../calc/defaults";
import {
  STORAGE_KEY,
  type KeyValueStorage,
  clearAssumptions,
  decimalToPercent,
  formatFieldValue,
  loadAssumptions,
  parseField,
  percentToDecimal,
  sanitizeAssumptions,
  saveAssumptions,
} from "./assumptionsInput";

// A tiny in-memory stand-in for window.localStorage, so these tests run in
// Vitest's node environment without a browser.
function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

// Storage that throws on every call, like Safari private mode or a full quota.
const brokenStorage: KeyValueStorage = {
  getItem: () => {
    throw new Error("denied");
  },
  setItem: () => {
    throw new Error("denied");
  },
  removeItem: () => {
    throw new Error("denied");
  },
};

describe("percentToDecimal", () => {
  it("converts a percentage to a decimal", () => {
    expect(percentToDecimal(10)).toBe(0.1);
    expect(percentToDecimal(25)).toBe(0.25);
    expect(percentToDecimal(0)).toBe(0);
    expect(percentToDecimal(7.5)).toBe(0.075);
  });
});

describe("decimalToPercent", () => {
  it("converts a decimal to a percentage", () => {
    expect(decimalToPercent(0.1)).toBe(10);
    expect(decimalToPercent(0.075)).toBe(7.5);
  });

  it("removes floating-point noise (0.07 * 100 is 7.000000000000001)", () => {
    expect(decimalToPercent(0.07)).toBe(7);
  });

  it("round-trips the default rates", () => {
    for (const rate of [
      DEFAULT_ASSUMPTIONS.contingencyRate,
      DEFAULT_ASSUMPTIONS.resortTicketDiscountRate,
    ]) {
      expect(percentToDecimal(decimalToPercent(rate))).toBe(rate);
    }
  });
});

describe("formatFieldValue", () => {
  it("shows percentages as %, everything else as-is", () => {
    expect(formatFieldValue(0.1, "percent")).toBe("10");
    expect(formatFieldValue(20, "count")).toBe("20");
    expect(formatFieldValue(62.5, "money")).toBe("62.5");
  });
});

describe("parseField", () => {
  it("accepts whole numbers for counts, including 0 and padding", () => {
    expect(parseField("21", "count")).toEqual({ ok: true, value: 21 });
    expect(parseField("0", "count")).toEqual({ ok: true, value: 0 });
    expect(parseField(" 21 ", "count")).toEqual({ ok: true, value: 21 });
  });

  it("rejects fractions for counts", () => {
    expect(parseField("2.5", "count")).toEqual({
      ok: false,
      error: "Must be a whole number",
    });
  });

  it("rejects negatives", () => {
    const negative = { ok: false, error: "Can't be negative" };
    expect(parseField("-1", "count")).toEqual(negative);
    expect(parseField("-5", "money")).toEqual(negative);
    expect(parseField("-5", "percent")).toEqual(negative);
  });

  it("rejects empty and non-numeric text", () => {
    const notANumber = { ok: false, error: "Enter a number" };
    for (const text of ["", "   ", "abc", "12abc", "1e3", "$5", "-"]) {
      expect(parseField(text, "money"), text).toEqual(notANumber);
    }
  });

  it("accepts decimals for money", () => {
    expect(parseField("62.5", "money")).toEqual({ ok: true, value: 62.5 });
  });

  it("returns percentages as decimals", () => {
    expect(parseField("10", "percent")).toEqual({ ok: true, value: 0.1 });
    expect(parseField("7.5", "percent")).toEqual({ ok: true, value: 0.075 });
  });
});

describe("loadAssumptions", () => {
  it("returns defaults when nothing is stored", () => {
    expect(loadAssumptions(memoryStorage())).toEqual(DEFAULT_ASSUMPTIONS);
  });

  it("returns saved values", () => {
    const saved = { ...DEFAULT_ASSUMPTIONS, numberOfKids: 30, grants: 7500 };
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(saved) });
    expect(loadAssumptions(storage)).toEqual(saved);
  });

  it("fills in missing fields from defaults", () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ numberOfKids: 30 }),
    });
    expect(loadAssumptions(storage)).toEqual({
      ...DEFAULT_ASSUMPTIONS,
      numberOfKids: 30,
    });
  });

  it("returns defaults for corrupt JSON or a non-object", () => {
    for (const raw of ["{not json", "null", "42", '"text"', "[1,2]"]) {
      const storage = memoryStorage({ [STORAGE_KEY]: raw });
      expect(loadAssumptions(storage), raw).toEqual(DEFAULT_ASSUMPTIONS);
    }
  });

  it("ignores unknown keys", () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({ somethingElse: 99 }),
    });
    const loaded = loadAssumptions(storage);
    expect(loaded).toEqual(DEFAULT_ASSUMPTIONS);
    expect(loaded).not.toHaveProperty("somethingElse");
  });

  it("replaces invalid fields with their default and keeps valid ones", () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        numberOfKids: 2.5, // fractional count
        volunteers: -1, // negative
        grants: "lots", // not a number
        insurance: null, // not a number (NaN/Infinity become null in JSON)
        marketing: 750, // valid
      }),
    });
    expect(loadAssumptions(storage)).toEqual({
      ...DEFAULT_ASSUMPTIONS,
      marketing: 750,
    });
  });

  it("returns defaults when storage throws", () => {
    expect(loadAssumptions(brokenStorage)).toEqual(DEFAULT_ASSUMPTIONS);
  });
});

describe("saveAssumptions / clearAssumptions", () => {
  it("round-trips through storage", () => {
    const storage = memoryStorage();
    const changed = { ...DEFAULT_ASSUMPTIONS, numberOfKids: 21 };
    saveAssumptions(storage, changed);
    expect(loadAssumptions(storage)).toEqual(changed);
  });

  it("clear removes the saved value", () => {
    const storage = memoryStorage();
    saveAssumptions(storage, { ...DEFAULT_ASSUMPTIONS, numberOfKids: 21 });
    clearAssumptions(storage);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
    expect(loadAssumptions(storage)).toEqual(DEFAULT_ASSUMPTIONS);
  });

  it("does not throw when storage fails", () => {
    expect(() =>
      saveAssumptions(brokenStorage, DEFAULT_ASSUMPTIONS),
    ).not.toThrow();
    expect(() => clearAssumptions(brokenStorage)).not.toThrow();
  });
});

describe("sanitizeAssumptions", () => {
  it("merges valid fields over the defaults and drops the rest", () => {
    expect(
      sanitizeAssumptions({ numberOfKids: 30, volunteers: -1, extra: 1 }),
    ).toEqual({ ...DEFAULT_ASSUMPTIONS, numberOfKids: 30 });
  });

  it("returns defaults for anything that isn't an object", () => {
    for (const value of [null, 42, "text", [1, 2], undefined]) {
      expect(sanitizeAssumptions(value)).toEqual(DEFAULT_ASSUMPTIONS);
    }
  });
});
