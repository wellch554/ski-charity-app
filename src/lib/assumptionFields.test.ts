import { describe, expect, it } from "vitest";
import { DEFAULT_ASSUMPTIONS } from "../calc/defaults";
import { ALL_FIELDS, ASSUMPTION_SECTIONS, fieldKind } from "./assumptionFields";

describe("assumption fields", () => {
  it("has one field for every Assumptions key, each exactly once", () => {
    const keys = ALL_FIELDS.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect([...keys].sort()).toEqual(Object.keys(DEFAULT_ASSUMPTIONS).sort());
  });

  it("has unique labels (Playwright finds fields by label)", () => {
    const labels = ALL_FIELDS.map((f) => f.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("uses the sections from the spreadsheet, in order", () => {
    expect(ASSUMPTION_SECTIONS.map((s) => s.title)).toEqual([
      "Program size",
      "Per-child costs",
      "Staffing & transport",
      "Adaptive track",
      "Fixed costs",
      "Funding",
    ]);
  });

  it("marks the two rates as percentages", () => {
    const percents = ALL_FIELDS.filter((f) => f.kind === "percent").map(
      (f) => f.key,
    );
    expect(percents.sort()).toEqual([
      "contingencyRate",
      "resortTicketDiscountRate",
    ]);
  });

  it("marks headcounts and days as whole-number counts", () => {
    const counts = ALL_FIELDS.filter((f) => f.kind === "count").map(
      (f) => f.key,
    );
    expect(counts.sort()).toEqual(
      [
        "adaptiveParticipants",
        "busCapacity",
        "kidsPerInstructor",
        "numberOfKids",
        "skiDays",
        "volunteers",
      ].sort(),
    );
    expect(fieldKind("numberOfKids")).toBe("count");
    expect(fieldKind("liftTicket")).toBe("money");
  });
});
