// Named scenarios (issue #10): presets, list operations, name validation,
// "edited" tracking and localStorage. Pure functions only. Every operation
// returns a new state and never changes its input, so React state updates
// stay simple and everything here is unit-tested in scenarios.test.ts.
import { type Assumptions, DEFAULT_ASSUMPTIONS } from "../calc/defaults";
import { ALL_FIELDS } from "./assumptionFields";
import { type KeyValueStorage, sanitizeAssumptions } from "./assumptionsInput";

export interface Scenario {
  id: string;
  name: string;
  assumptions: Assumptions;
}

export interface ScenarioState {
  scenarios: Scenario[];
  /** The scenario last loaded into the form (or saved from it), if any. */
  activeId: string | null;
}

export type NameResult =
  { ok: true; name: string } | { ok: false; error: string };

export type ScenarioStatus =
  { kind: "none" } | { kind: "loaded"; name: string; edited: boolean };

// --- Presets -------------------------------------------------------------

// Kids and volunteers scale together, so the default ratio (6 volunteers per
// 20 kids) holds; every other input stays at its default.
const PRESETS = [
  { id: "pilot", name: "Pilot", scale: 1 },
  { id: "mid", name: "Mid", scale: 2 },
  { id: "full", name: "Full", scale: 5 },
];

export function createPresetScenarios(): Scenario[] {
  return PRESETS.map(({ id, name, scale }) => ({
    id,
    name,
    assumptions: {
      ...DEFAULT_ASSUMPTIONS,
      numberOfKids: DEFAULT_ASSUMPTIONS.numberOfKids * scale,
      volunteers: DEFAULT_ASSUMPTIONS.volunteers * scale,
    },
  }));
}

// --- Names ---------------------------------------------------------------

// The compare table's live column. A scenario with this name would be
// indistinguishable from it.
const RESERVED_NAME = "Current";

/**
 * Check a name for Save As (no ignoreId) or Rename (ignoreId = the scenario
 * being renamed, so it can keep its own name, e.g. to change capitals).
 */
export function validateScenarioName(
  name: string,
  scenarios: Scenario[],
  ignoreId?: string,
): NameResult {
  const trimmed = name.trim();
  if (trimmed === "") return { ok: false, error: "Enter a name" };

  const lower = trimmed.toLowerCase();
  if (lower === RESERVED_NAME.toLowerCase()) {
    return {
      ok: false,
      error: `"${RESERVED_NAME}" is reserved for the live inputs`,
    };
  }
  const clash = scenarios.find(
    (s) => s.id !== ignoreId && s.name.toLowerCase() === lower,
  );
  if (clash) {
    return {
      ok: false,
      error: `A scenario called "${clash.name}" already exists`,
    };
  }
  return { ok: true, name: trimmed };
}

// --- List operations -----------------------------------------------------
// Names are assumed valid here: callers run validateScenarioName first.

/** Save As: append a copy of the values and make it the active scenario. */
export function addScenario(
  state: ScenarioState,
  id: string,
  name: string,
  assumptions: Assumptions,
): ScenarioState {
  return {
    scenarios: [
      ...state.scenarios,
      { id, name, assumptions: { ...assumptions } },
    ],
    activeId: id,
  };
}

export function renameScenario(
  state: ScenarioState,
  id: string,
  name: string,
): ScenarioState {
  return {
    ...state,
    scenarios: state.scenarios.map((s) => (s.id === id ? { ...s, name } : s)),
  };
}

/** Save: replace a scenario's values with a copy of the given ones. */
export function updateScenario(
  state: ScenarioState,
  id: string,
  assumptions: Assumptions,
): ScenarioState {
  return {
    ...state,
    scenarios: state.scenarios.map((s) =>
      s.id === id ? { ...s, assumptions: { ...assumptions } } : s,
    ),
  };
}

export function deleteScenario(
  state: ScenarioState,
  id: string,
): ScenarioState {
  return {
    scenarios: state.scenarios.filter((s) => s.id !== id),
    activeId: state.activeId === id ? null : state.activeId,
  };
}

/** Set the active scenario; an unknown id clears it. */
export function setActive(
  state: ScenarioState,
  id: string | null,
): ScenarioState {
  const exists = id !== null && state.scenarios.some((s) => s.id === id);
  return { ...state, activeId: exists ? id : null };
}

// --- Status --------------------------------------------------------------

export function assumptionsEqual(a: Assumptions, b: Assumptions): boolean {
  return ALL_FIELDS.every(({ key }) => a[key] === b[key]);
}

/**
 * What the scenario bar shows. "Edited" is worked out by comparing values
 * rather than stored as a flag, so changing a value back clears it.
 */
export function scenarioStatus(
  state: ScenarioState,
  current: Assumptions,
): ScenarioStatus {
  const active = state.scenarios.find((s) => s.id === state.activeId);
  if (!active) return { kind: "none" };
  return {
    kind: "loaded",
    name: active.name,
    edited: !assumptionsEqual(active.assumptions, current),
  };
}

// --- localStorage --------------------------------------------------------

// Separate from the v1 form inputs. Bump the version on incompatible changes.
export const SCENARIOS_STORAGE_KEY = "ski-cost-model:scenarios:v1";

function presetState(): ScenarioState {
  return { scenarios: createPresetScenarios(), activeId: null };
}

/**
 * Saved scenarios, or the presets if nothing (or nothing readable) is saved.
 * A saved empty list stays empty, so deleted presets don't come back.
 */
export function loadScenarios(storage: KeyValueStorage): ScenarioState {
  let saved: unknown;
  try {
    const raw = storage.getItem(SCENARIOS_STORAGE_KEY);
    if (raw === null) return presetState();
    saved = JSON.parse(raw);
  } catch {
    // Storage blocked (e.g. private mode) or corrupt JSON.
    return presetState();
  }
  if (typeof saved !== "object" || saved === null) return presetState();
  const { scenarios, activeId } = saved as Record<string, unknown>;
  if (!Array.isArray(scenarios)) return presetState();

  // Keep entries with a usable id and name; their values are checked field
  // by field, the same way as the v1 form inputs.
  const seen = new Set<string>();
  const valid: Scenario[] = [];
  for (const entry of scenarios) {
    if (typeof entry !== "object" || entry === null) continue;
    const { id, name, assumptions } = entry as Record<string, unknown>;
    if (typeof id !== "string" || id === "" || seen.has(id)) continue;
    if (typeof name !== "string" || name.trim() === "") continue;
    seen.add(id);
    valid.push({ id, name, assumptions: sanitizeAssumptions(assumptions) });
  }

  return setActive(
    { scenarios: valid, activeId: null },
    typeof activeId === "string" ? activeId : null,
  );
}

export function saveScenarios(storage: KeyValueStorage, state: ScenarioState) {
  try {
    storage.setItem(SCENARIOS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Not saving is better than crashing; the page still works.
  }
}
