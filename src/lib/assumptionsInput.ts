/* eslint-disable @typescript-eslint/no-unused-vars -- temporary stub */
import type { Assumptions } from "../calc/defaults";
import type { FieldKind } from "./assumptionFields";

// STUB: not implemented yet (tests first).
export const STORAGE_KEY = "ski-cost-model:assumptions:v1";
export type KeyValueStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;
export type ParseResult =
  { ok: true; value: number } | { ok: false; error: string };

const todo = (): never => {
  throw new Error("not implemented");
};
export const percentToDecimal = (_p: number): number => todo();
export const decimalToPercent = (_d: number): number => todo();
export const formatFieldValue = (_v: number, _k: FieldKind): string => todo();
export const parseField = (_t: string, _k: FieldKind): ParseResult => todo();
export const loadAssumptions = (_s: KeyValueStorage): Assumptions => todo();
export const saveAssumptions = (_s: KeyValueStorage, _a: Assumptions): void =>
  todo();
export const clearAssumptions = (_s: KeyValueStorage): void => todo();
