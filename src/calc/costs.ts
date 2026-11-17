// Summary tab of the spreadsheet. Pure function: no rounding here; round only
// when displaying (see src/lib/formatCurrency.ts).
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

export function calculateCosts(a: Assumptions): CostSummary {
  const kids = a.numberOfKids;
  const kidDays = kids * a.skiDays;

  // Variable costs
  const liftTickets = kidDays * a.liftTicket;
  const equipmentRental = kidDays * a.equipmentRental;
  const food = kidDays * a.food;

  // Spreadsheet quirk: a "kids per instructor" of 0 is treated as 1 (MAX(x,1)).
  const instructorsNeeded = Math.ceil(kids / Math.max(a.kidsPerInstructor, 1));
  const instructorCost = instructorsNeeded * a.instructorCostPerDay * a.skiDays;

  // Volunteers ride the bus too, so with 0 kids we still book 1 bus
  // (spreadsheet quirk). ASSUMED, not verified against the spreadsheet:
  // a bus capacity of 0 is treated as 1, matching the instructor guard.
  const busesNeeded = Math.ceil(
    (kids + a.volunteers) / Math.max(a.busCapacity, 1),
  );
  const transportation = busesNeeded * a.busCharterPerDay * a.skiDays;

  const loanerOuterwear = kids * a.loanerOuterwear;
  const adaptiveTrack =
    a.adaptiveParticipants *
    (a.adaptiveLessonExtraPerDay + a.adaptiveEquipmentExtraPerDay) *
    a.skiDays;

  const totalVariable =
    liftTickets +
    equipmentRental +
    food +
    instructorCost +
    transportation +
    loanerOuterwear +
    adaptiveTrack;

  // Fixed costs
  const coordinator = a.coordinatorStipend;
  const insurance = a.insurance;
  const backgroundChecks = a.volunteers * a.backgroundCheckPerVolunteer;
  const marketing = a.marketing;
  const totalFixed = coordinator + insurance + backgroundChecks + marketing;

  // Totals. Per-child figures are 0 when there are no kids (spreadsheet guard).
  // ASSUMED, not verified against the spreadsheet: costPerChildDay is also 0
  // when skiDays is 0.
  const subtotal = totalVariable + totalFixed;
  const contingency = subtotal * a.contingencyRate;
  const totalCost = subtotal + contingency;
  const costPerChild = kids > 0 ? totalCost / kids : 0;
  const costPerChildDay = kidDays > 0 ? totalCost / kidDays : 0;

  // Funding and gap. A negative gap means a surplus.
  const resortTicketDiscount = liftTickets * a.resortTicketDiscountRate;
  const grantsSponsorsDonations =
    a.grants + a.corporateSponsors + a.individualDonations;
  const totalFunding = resortTicketDiscount + grantsSponsorsDonations;
  const fundingGap = totalCost - totalFunding;

  return {
    liftTickets,
    equipmentRental,
    food,
    instructorsNeeded,
    instructorCost,
    busesNeeded,
    transportation,
    loanerOuterwear,
    adaptiveTrack,
    totalVariable,
    coordinator,
    insurance,
    backgroundChecks,
    marketing,
    totalFixed,
    subtotal,
    contingency,
    totalCost,
    costPerChild,
    costPerChildDay,
    resortTicketDiscount,
    grantsSponsorsDonations,
    totalFunding,
    fundingGap,
  };
}
