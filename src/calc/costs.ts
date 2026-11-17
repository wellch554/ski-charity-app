// Summary tab of the spreadsheet.
//
// STUB: only the result shape is declared so that costs.test.ts compiles.
// The calculation is not implemented yet; its tests are skipped until it is.
//
// Why NaN instead of throwing: Vitest still runs the body of a describe.skip
// block while collecting tests, and costs.test.ts calls calculateCosts() there.
// A throw would fail the whole file. NaN is clearly "not a real number" and
// would fail every assertion if the tests were un-skipped too early.
import type { Assumptions } from "./defaults";

export interface CostSummary {
  // Variable costs
  liftTickets: number;
  equipmentRental: number;
  food: number;
  instructorsNeeded: number;
  instructorCost: number;
  busesNeeded: number;
  transportation: number;
  loanerOuterwear: number;
  adaptiveTrack: number;
  totalVariable: number;
  // Fixed costs
  coordinator: number;
  insurance: number;
  backgroundChecks: number;
  marketing: number;
  totalFixed: number;
  // Totals
  subtotal: number;
  contingency: number;
  totalCost: number;
  costPerChild: number;
  costPerChildDay: number;
  // Funding and gap
  resortTicketDiscount: number;
  grantsSponsorsDonations: number;
  totalFunding: number;
  fundingGap: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function calculateCosts(_a: Assumptions): CostSummary {
  return {
    liftTickets: NaN,
    equipmentRental: NaN,
    food: NaN,
    instructorsNeeded: NaN,
    instructorCost: NaN,
    busesNeeded: NaN,
    transportation: NaN,
    loanerOuterwear: NaN,
    adaptiveTrack: NaN,
    totalVariable: NaN,
    coordinator: NaN,
    insurance: NaN,
    backgroundChecks: NaN,
    marketing: NaN,
    totalFixed: NaN,
    subtotal: NaN,
    contingency: NaN,
    totalCost: NaN,
    costPerChild: NaN,
    costPerChildDay: NaN,
    resortTicketDiscount: NaN,
    grantsSponsorsDonations: NaN,
    totalFunding: NaN,
    fundingGap: NaN,
  };
}
