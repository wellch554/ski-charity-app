/* eslint-disable @typescript-eslint/no-unused-vars -- temporary stub */
import type { Assumptions } from "../calc/defaults";
import type { KeyValueStorage } from "./assumptionsInput";

// STUB: not implemented yet (tests first).
export const SCENARIOS_STORAGE_KEY = "ski-cost-model:scenarios:v1";
export interface Scenario {
  id: string;
  name: string;
  assumptions: Assumptions;
}
export interface ScenarioState {
  scenarios: Scenario[];
  activeId: string | null;
}
export type NameResult =
  { ok: true; name: string } | { ok: false; error: string };
export type ScenarioStatus =
  { kind: "none" } | { kind: "loaded"; name: string; edited: boolean };

const todo = (): never => {
  throw new Error("not implemented");
};
export const createPresetScenarios = (): Scenario[] => todo();
export const validateScenarioName = (
  _name: string,
  _list: Scenario[],
  _ignoreId?: string,
): NameResult => todo();
export const addScenario = (
  _s: ScenarioState,
  _id: string,
  _name: string,
  _a: Assumptions,
): ScenarioState => todo();
export const renameScenario = (
  _s: ScenarioState,
  _id: string,
  _n: string,
): ScenarioState => todo();
export const updateScenario = (
  _s: ScenarioState,
  _id: string,
  _a: Assumptions,
): ScenarioState => todo();
export const deleteScenario = (_s: ScenarioState, _id: string): ScenarioState =>
  todo();
export const setActive = (
  _s: ScenarioState,
  _id: string | null,
): ScenarioState => todo();
export const assumptionsEqual = (_a: Assumptions, _b: Assumptions): boolean =>
  todo();
export const scenarioStatus = (
  _s: ScenarioState,
  _a: Assumptions,
): ScenarioStatus => todo();
export const loadScenarios = (_s: KeyValueStorage): ScenarioState => todo();
export const saveScenarios = (_s: KeyValueStorage, _st: ScenarioState): void =>
  todo();
