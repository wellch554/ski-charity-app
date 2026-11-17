import { describe, expect, it } from "vitest";
import { calculateCosts } from "../calc/costs";
import { type Assumptions, DEFAULT_ASSUMPTIONS } from "../calc/defaults";
import type { KeyValueStorage } from "./assumptionsInput";
import {
  SCENARIOS_STORAGE_KEY,
  type Scenario,
  type ScenarioState,
  addScenario,
  assumptionsEqual,
  createPresetScenarios,
  deleteScenario,
  loadScenarios,
  renameScenario,
  saveScenarios,
  scenarioStatus,
  setActive,
  updateScenario,
  validateScenarioName,
} from "./scenarios";

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
}

const brokenStorage: KeyValueStorage = {
  getItem: () => {
    throw new Error("denied");
  },
  setItem: () => {
    throw new Error("denied");
  },
  removeItem: () => {
    throw new Error("denied");
  },
};

const D = DEFAULT_ASSUMPTIONS;
const scenario = (id: string, name: string, a: Partial<Assumptions> = {}) => ({
  id,
  name,
  assumptions: { ...D, ...a },
});
const sample = (): ScenarioState => ({
  scenarios: [
    scenario("a", "Alpha"),
    scenario("b", "Beta", { numberOfKids: 9 }),
  ],
  activeId: "a",
});

describe("createPresetScenarios", () => {
  // Called inside each test (not at collection time) so failures are per test.
  const presets = () => createPresetScenarios();
  const byName = (name: string) => presets().find((s) => s.name === name)!;

  it("creates Pilot, Mid and Full with fixed ids", () => {
    expect(presets().map((s) => [s.id, s.name])).toEqual([
      ["pilot", "Pilot"],
      ["mid", "Mid"],
      ["full", "Full"],
    ]);
  });

  it("scales kids and volunteers 1× / 2× / 5×; everything else is default", () => {
    expect(byName("Pilot").assumptions).toEqual(D);
    expect(byName("Mid").assumptions).toEqual({
      ...D,
      numberOfKids: 40,
      volunteers: 12,
    });
    expect(byName("Full").assumptions).toEqual({
      ...D,
      numberOfKids: 100,
      volunteers: 30,
    });
  });

  // Worked out with calculateCosts and checked by hand (issue #10), not
  // taken from the spreadsheet.
  it("produces the expected totals and gaps", () => {
    const r = (name: string) => calculateCosts(byName(name).assumptions);
    expect(r("Pilot").totalCost).toBeCloseTo(27258, 6);
    expect(r("Mid").totalCost).toBeCloseTo(46816, 6);
    expect(r("Full").totalCost).toBeCloseTo(94930, 6);
    expect(r("Pilot").fundingGap).toBeCloseTo(16058, 6);
    expect(r("Mid").fundingGap).toBeCloseTo(34416, 6);
    expect(r("Full").fundingGap).toBeCloseTo(78930, 6);
  });

  it("returns fresh objects each time", () => {
    const again = createPresetScenarios();
    expect(again[0].assumptions).not.toBe(presets()[0].assumptions);
    expect(again[0].assumptions).not.toBe(D);
  });
});

describe("validateScenarioName", () => {
  const list = sample().scenarios;

  it("trims and accepts a new name", () => {
    expect(validateScenarioName("  Gamma ", list)).toEqual({
      ok: true,
      name: "Gamma",
    });
  });

  it("rejects an empty name", () => {
    for (const name of ["", "   "]) {
      expect(validateScenarioName(name, list)).toEqual({
        ok: false,
        error: "Enter a name",
      });
    }
  });

  it("rejects a duplicate, ignoring case", () => {
    expect(validateScenarioName("beta", list)).toEqual({
      ok: false,
      error: 'A scenario called "Beta" already exists',
    });
  });

  it('reserves "Current" (the live column)', () => {
    expect(validateScenarioName("current", list)).toEqual({
      ok: false,
      error: '"Current" is reserved for the live inputs',
    });
  });

  it("lets a scenario keep its own name, e.g. to change capitals", () => {
    expect(validateScenarioName("BETA", list, "b")).toEqual({
      ok: true,
      name: "BETA",
    });
  });
});

describe("list operations", () => {
  it("addScenario appends, makes it active and copies the values", () => {
    const state = sample();
    const values = { ...D, numberOfKids: 30 };
    const next = addScenario(state, "c", "Gamma", values);
    expect(next.scenarios.map((s) => s.name)).toEqual([
      "Alpha",
      "Beta",
      "Gamma",
    ]);
    expect(next.activeId).toBe("c");
    expect(next.scenarios[2].assumptions).toEqual(values);
    expect(next.scenarios[2].assumptions).not.toBe(values);
    expect(state).toEqual(sample()); // input not changed
  });

  it("renameScenario changes only the target", () => {
    const state = sample();
    const next = renameScenario(state, "b", "Bravo");
    expect(next.scenarios.map((s) => s.name)).toEqual(["Alpha", "Bravo"]);
    expect(next.scenarios[1].assumptions).toEqual(
      state.scenarios[1].assumptions,
    );
    expect(state).toEqual(sample());
  });

  it("updateScenario replaces only the target's values", () => {
    const state = sample();
    const values = { ...D, numberOfKids: 41 };
    const next = updateScenario(state, "a", values);
    expect(next.scenarios[0].assumptions).toEqual(values);
    expect(next.scenarios[0].assumptions).not.toBe(values);
    expect(next.scenarios[1]).toEqual(state.scenarios[1]);
    expect(state).toEqual(sample());
  });

  it("deleteScenario removes it and clears activeId if it was active", () => {
    const state = sample();
    expect(deleteScenario(state, "b")).toEqual({
      scenarios: [state.scenarios[0]],
      activeId: "a",
    });
    expect(deleteScenario(state, "a")).toEqual({
      scenarios: [state.scenarios[1]],
      activeId: null,
    });
    expect(state).toEqual(sample());
  });

  it("unknown ids change nothing", () => {
    const state = sample();
    expect(renameScenario(state, "zz", "X")).toEqual(state);
    expect(updateScenario(state, "zz", D)).toEqual(state);
    expect(deleteScenario(state, "zz")).toEqual(state);
  });

  it("setActive sets or clears the active scenario", () => {
    expect(setActive(sample(), "b").activeId).toBe("b");
    expect(setActive(sample(), null).activeId).toBeNull();
    expect(setActive(sample(), "zz").activeId).toBeNull();
  });
});

describe("assumptionsEqual", () => {
  it("compares every field", () => {
    expect(assumptionsEqual(D, { ...D })).toBe(true);
    expect(assumptionsEqual(D, { ...D, contingencyRate: 0.2 })).toBe(false);
  });
});

describe("scenarioStatus", () => {
  it("is none when nothing is active", () => {
    expect(scenarioStatus({ ...sample(), activeId: null }, D)).toEqual({
      kind: "none",
    });
  });

  it("is loaded and not edited when the form matches", () => {
    expect(scenarioStatus(sample(), { ...D })).toEqual({
      kind: "loaded",
      name: "Alpha",
      edited: false,
    });
  });

  it("is edited when any value differs, and not after changing it back", () => {
    const state = sample();
    expect(scenarioStatus(state, { ...D, numberOfKids: 21 })).toEqual({
      kind: "loaded",
      name: "Alpha",
      edited: true,
    });
    expect(scenarioStatus(state, { ...D, numberOfKids: 20 }).kind).toBe(
      "loaded",
    );
    expect(scenarioStatus(state, { ...D, numberOfKids: 20 })).toHaveProperty(
      "edited",
      false,
    );
  });
});

describe("loadScenarios / saveScenarios", () => {
  const stored = (value: unknown) =>
    memoryStorage({ [SCENARIOS_STORAGE_KEY]: JSON.stringify(value) });
  const presetState = () => ({
    scenarios: createPresetScenarios(),
    activeId: null,
  });

  it("returns the presets, with nothing active, when nothing is stored", () => {
    expect(loadScenarios(memoryStorage())).toEqual(presetState());
  });

  it("round-trips through storage, including activeId", () => {
    const storage = memoryStorage();
    const state = addScenario(sample(), "c", "Gamma", { ...D, grants: 1 });
    saveScenarios(storage, state);
    expect(loadScenarios(storage)).toEqual(state);
  });

  it("keeps an empty list (deleted presets don't come back)", () => {
    expect(loadScenarios(stored({ scenarios: [], activeId: null }))).toEqual({
      scenarios: [],
      activeId: null,
    });
  });

  it("returns the presets for corrupt or wrongly shaped data", () => {
    const bad = [
      memoryStorage({ [SCENARIOS_STORAGE_KEY]: "{not json" }),
      stored(null),
      stored([1, 2]),
      stored({ scenarios: "nope" }),
    ];
    for (const storage of bad) {
      expect(loadScenarios(storage)).toEqual(presetState());
    }
  });

  it("returns the presets when storage throws", () => {
    expect(loadScenarios(brokenStorage)).toEqual(presetState());
  });

  it("drops entries with a bad id or name, and duplicate ids", () => {
    const good: Scenario = scenario("a", "Alpha");
    const loaded = loadScenarios(
      stored({
        scenarios: [
          good,
          { id: "", name: "No id", assumptions: D },
          { id: "x", name: "   ", assumptions: D },
          { id: 5, name: "Number id", assumptions: D },
          { id: "a", name: "Duplicate id", assumptions: D },
          "not an object",
        ],
        activeId: "a",
      }),
    );
    expect(loaded).toEqual({ scenarios: [good], activeId: "a" });
  });

  it("replaces invalid values with defaults, field by field", () => {
    const loaded = loadScenarios(
      stored({
        scenarios: [
          {
            id: "a",
            name: "Alpha",
            assumptions: { numberOfKids: 2.5, grants: -1, marketing: 750 },
          },
        ],
        activeId: null,
      }),
    );
    expect(loaded.scenarios[0].assumptions).toEqual({ ...D, marketing: 750 });
  });

  it("clears an activeId that matches no scenario", () => {
    const loaded = loadScenarios(
      stored({ scenarios: [scenario("a", "Alpha")], activeId: "gone" }),
    );
    expect(loaded.activeId).toBeNull();
  });

  it("does not throw when saving fails", () => {
    expect(() => saveScenarios(brokenStorage, sample())).not.toThrow();
  });
});
