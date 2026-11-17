// Mirrors the Assumptions tab of the spreadsheet. Defaults are placeholders.
export interface Assumptions {
  // Program size
  numberOfKids: number;
  skiDays: number;
  kidsPerInstructor: number;
  volunteers: number;
  busCapacity: number;
  // Per child per day ($)
  liftTicket: number;
  equipmentRental: number;
  food: number;
  // Per day ($)
  instructorCostPerDay: number;
  busCharterPerDay: number;
  // Per child per season ($)
  loanerOuterwear: number;
  // Adaptive track
  adaptiveParticipants: number;
  adaptiveLessonExtraPerDay: number;
  adaptiveEquipmentExtraPerDay: number;
  // Fixed per season ($)
  coordinatorStipend: number;
  insurance: number;
  backgroundCheckPerVolunteer: number;
  marketing: number;
  contingencyRate: number; // 0.10 = 10%
  // Funding
  resortTicketDiscountRate: number; // share of lift ticket cost
  grants: number;
  corporateSponsors: number;
  individualDonations: number;
}

export const DEFAULT_ASSUMPTIONS: Assumptions = {
  numberOfKids: 20,
  skiDays: 4,
  kidsPerInstructor: 5,
  volunteers: 6,
  busCapacity: 50,
  liftTicket: 60,
  equipmentRental: 25,
  food: 15,
  instructorCostPerDay: 250,
  busCharterPerDay: 1200,
  loanerOuterwear: 40,
  adaptiveParticipants: 0,
  adaptiveLessonExtraPerDay: 150,
  adaptiveEquipmentExtraPerDay: 50,
  coordinatorStipend: 5000,
  insurance: 1500,
  backgroundCheckPerVolunteer: 30,
  marketing: 500,
  contingencyRate: 0.1,
  resortTicketDiscountRate: 0.25,
  grants: 5000,
  corporateSponsors: 3000,
  individualDonations: 2000,
};
