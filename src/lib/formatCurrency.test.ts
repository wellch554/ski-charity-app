import { describe, expect, it } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats whole dollars with a thousands separator", () => {
    expect(formatCurrency(27258)).toBe("$27,258");
  });

  it("rounds to the nearest dollar for display", () => {
    expect(formatCurrency(1362.9)).toBe("$1,363");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("shows negatives (e.g. a funding surplus) with a minus sign", () => {
    expect(formatCurrency(-18942)).toBe("-$18,942");
  });

  it("does not show a minus sign on amounts that round to $0", () => {
    // e.g. a funding gap that is really zero but comes out as a tiny
    // negative float, because calculations are never rounded.
    expect(formatCurrency(-0.4)).toBe("$0");
    expect(formatCurrency(-1e-12)).toBe("$0");
  });
});
