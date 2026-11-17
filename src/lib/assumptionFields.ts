/* eslint-disable @typescript-eslint/no-unused-vars -- temporary stub */
import type { Assumptions } from "../calc/defaults";

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

// STUB: not implemented yet (tests first).
export const ASSUMPTION_SECTIONS: Section[] = [];
export const ALL_FIELDS: FieldDef[] = [];
export function fieldKind(_key: AssumptionKey): FieldKind {
  throw new Error("not implemented");
}
