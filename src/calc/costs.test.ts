// Expected values come from the spreadsheet's Summary tab. Do not edit them
// to make tests pass – fix the code (or ask) instead.
import { describe, it, expect } from "vitest";
import { calculateCosts } from "./costs";
import { DEFAULT_ASSUMPTIONS, type Assumptions } from "./defaults";

const withInputs = (overrides: Partial<Assumptions>) =>
  calculateCosts({ ...DEFAULT_ASSUMPTIONS, ...overrides });

describe("calculateCosts – default assumptions (matches spreadsheet)", () => {
  const r = calculateCosts(DEFAULT_ASSUMPTIONS);

  it("variable costs", () => {
    expect(r.liftTickets).toBe(4800);
    expect(r.equipmentRental).toBe(2000);
    expect(r.food).toBe(1200);
    expect(r.instructorsNeeded).toBe(4);
    expect(r.instructorCost).toBe(4000);
    expect(r.busesNeeded).toBe(1);
    expect(r.transportation).toBe(4800);
    expect(r.loanerOuterwear).toBe(800);
    expect(r.adaptiveTrack).toBe(0);
    expect(r.totalVariable).toBe(17600);
  });

  it("fixed costs", () => {
    expect(r.coordinator).toBe(5000);
    expect(r.insurance).toBe(1500);
    expect(r.backgroundChecks).toBe(180);
    expect(r.marketing).toBe(500);
    expect(r.totalFixed).toBe(7180);
  });

  it("totals", () => {
    expect(r.subtotal).toBe(24780);
    expect(r.contingency).toBeCloseTo(2478, 6);
    expect(r.totalCost).toBeCloseTo(27258, 6);
    expect(r.costPerChild).toBeCloseTo(1362.9, 6);
    expect(r.costPerChildDay).toBeCloseTo(340.725, 6);
  });

  it("funding and gap", () => {
    expect(r.resortTicketDiscount).toBeCloseTo(1200, 6);
    expect(r.grantsSponsorsDonations).toBe(10000);
    expect(r.totalFunding).toBeCloseTo(11200, 6);
    expect(r.fundingGap).toBeCloseTo(16058, 6);
  });
});

describe("calculateCosts – step costs and edge cases", () => {
  it("44 kids + 6 volunteers = 50 seats → still 1 bus", () => {
    expect(withInputs({ numberOfKids: 44 }).busesNeeded).toBe(1);
  });

  it("45 kids + 6 volunteers = 51 seats → 2 buses", () => {
    const r = withInputs({ numberOfKids: 45 });
    expect(r.busesNeeded).toBe(2);
    expect(r.transportation).toBe(9600);
    expect(r.instructorsNeeded).toBe(9);
    expect(r.totalCost).toBeCloseTo(50138, 6);
    expect(r.fundingGap).toBeCloseTo(37438, 6);
  });

  it("21 kids rounds instructors up to 5", () => {
    const r = withInputs({ numberOfKids: 21 });
    expect(r.instructorsNeeded).toBe(5);
    expect(r.totalCost).toBeCloseTo(28842, 6);
  });

  it("adaptive track: 3 participants add $2,400", () => {
    const r = withInputs({ adaptiveParticipants: 3 });
    expect(r.adaptiveTrack).toBe(2400);
    expect(r.totalCost).toBeCloseTo(29898, 6);
    expect(r.costPerChild).toBeCloseTo(1494.9, 6);
  });

  it("zero kids: no divide-by-zero; per-child figures are 0", () => {
    const r = withInputs({ numberOfKids: 0 });
    expect(r.instructorsNeeded).toBe(0);
    expect(r.busesNeeded).toBe(1); // spreadsheet quirk: volunteers still ride
    expect(r.costPerChild).toBe(0);
    expect(r.costPerChildDay).toBe(0);
    expect(r.totalCost).toBeCloseTo(13178, 6);
  });

  it("kids per instructor of 0 is treated as 1", () => {
    const r = withInputs({ kidsPerInstructor: 0 });
    expect(r.instructorsNeeded).toBe(20);
    expect(r.totalCost).toBeCloseTo(44858, 6);
  });

  it("funding above cost gives a negative gap (surplus)", () => {
    expect(withInputs({ grants: 40000 }).fundingGap).toBeCloseTo(-18942, 6);
  });
});
