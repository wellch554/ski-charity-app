// Describes each input on the Assumptions form: its label, how it is parsed,
// and which spreadsheet section it belongs to. Lives in lib/ (not ui/) because
// loadAssumptions also needs each field's kind to validate stored values.
import type { Assumptions } from "../calc/defaults";

// count:   whole number, e.g. kids, days, volunteers
// money:   dollars, decimals allowed
// percent: entered and shown as a percentage (10), stored as a decimal (0.1)
export type FieldKind = "count" | "money" | "percent";
export type AssumptionKey = keyof Assumptions;

export interface FieldDef {
  key: AssumptionKey;
  label: string;
  kind: FieldKind;
}

export interface Section {
  title: string;
  fields: FieldDef[];
}

export const ASSUMPTION_SECTIONS: Section[] = [
  {
    title: "Program size",
    fields: [
      { key: "numberOfKids", label: "Number of kids", kind: "count" },
      { key: "skiDays", label: "Ski days", kind: "count" },
      { key: "kidsPerInstructor", label: "Kids per instructor", kind: "count" },
      { key: "volunteers", label: "Volunteers", kind: "count" },
      { key: "busCapacity", label: "Bus capacity (seats)", kind: "count" },
    ],
  },
  {
    title: "Per-child costs",
    fields: [
      {
        key: "liftTicket",
        label: "Lift ticket ($ per child per day)",
        kind: "money",
      },
      {
        key: "equipmentRental",
        label: "Equipment rental ($ per child per day)",
        kind: "money",
      },
      { key: "food", label: "Food ($ per child per day)", kind: "money" },
      {
        key: "loanerOuterwear",
        label: "Loaner outerwear ($ per child per season)",
        kind: "money",
      },
    ],
  },
  {
    title: "Staffing & transport",
    fields: [
      {
        key: "instructorCostPerDay",
        label: "Instructor ($ per instructor per day)",
        kind: "money",
      },
      {
        key: "busCharterPerDay",
        label: "Bus charter ($ per bus per day)",
        kind: "money",
      },
    ],
  },
  {
    title: "Adaptive track",
    fields: [
      {
        key: "adaptiveParticipants",
        label: "Adaptive participants",
        kind: "count",
      },
      {
        key: "adaptiveLessonExtraPerDay",
        label: "Adaptive lesson extra ($ per participant per day)",
        kind: "money",
      },
      {
        key: "adaptiveEquipmentExtraPerDay",
        label: "Adaptive equipment extra ($ per participant per day)",
        kind: "money",
      },
    ],
  },
  {
    title: "Fixed costs",
    fields: [
      {
        key: "coordinatorStipend",
        label: "Coordinator stipend ($)",
        kind: "money",
      },
      { key: "insurance", label: "Insurance ($)", kind: "money" },
      {
        key: "backgroundCheckPerVolunteer",
        label: "Background check ($ per volunteer)",
        kind: "money",
      },
      { key: "marketing", label: "Marketing ($)", kind: "money" },
      { key: "contingencyRate", label: "Contingency (%)", kind: "percent" },
    ],
  },
  {
    title: "Funding",
    fields: [
      {
        key: "resortTicketDiscountRate",
        label: "Resort lift-ticket discount (%)",
        kind: "percent",
      },
      { key: "grants", label: "Grants ($)", kind: "money" },
      {
        key: "corporateSponsors",
        label: "Corporate sponsors ($)",
        kind: "money",
      },
      {
        key: "individualDonations",
        label: "Individual donations ($)",
        kind: "money",
      },
    ],
  },
];

export const ALL_FIELDS: FieldDef[] = ASSUMPTION_SECTIONS.flatMap(
  (s) => s.fields,
);

const KIND_BY_KEY = new Map(ALL_FIELDS.map((f) => [f.key, f.kind]));

export function fieldKind(key: AssumptionKey): FieldKind {
  // Every key is listed (see assumptionFields.test.ts); "money" is a safe
  // fallback that only rejects negatives.
  return KIND_BY_KEY.get(key) ?? "money";
}
