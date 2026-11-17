import { useCallback, useEffect, useState } from "react";
import type { Assumptions } from "../calc/defaults";
import {
  type NameResult,
  type ScenarioState,
  addScenario,
  deleteScenario,
  loadScenarios,
  renameScenario,
  saveScenarios,
  setActive,
  updateScenario,
  validateScenarioName,
} from "../lib/scenarios";

/**
 * Saved scenarios and which one is loaded, restored from localStorage on
 * first render and saved again whenever they change. All logic lives in
 * src/lib/scenarios.ts; this hook just holds the state.
 *
 * saveAs and rename validate the name first and return the result, so the
 * UI can show the error message. Nothing changes if the name is invalid.
 */
export function useScenarios() {
  const [state, setState] = useState<ScenarioState>(() =>
    loadScenarios(window.localStorage),
  );

  useEffect(() => {
    saveScenarios(window.localStorage, state);
  }, [state]);

  const saveAs = useCallback(
    (name: string, assumptions: Assumptions): NameResult => {
      const result = validateScenarioName(name, state.scenarios);
      if (result.ok) {
        const id = crypto.randomUUID();
        setState((s) => addScenario(s, id, result.name, assumptions));
      }
      return result;
    },
    [state.scenarios],
  );

  const rename = useCallback(
    (id: string, name: string): NameResult => {
      const result = validateScenarioName(name, state.scenarios, id);
      if (result.ok) setState((s) => renameScenario(s, id, result.name));
      return result;
    },
    [state.scenarios],
  );

  /** Save: overwrite the active scenario with the given values. */
  const save = useCallback((assumptions: Assumptions) => {
    setState((s) =>
      s.activeId === null ? s : updateScenario(s, s.activeId, assumptions),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => deleteScenario(s, id));
  }, []);

  const activate = useCallback((id: string | null) => {
    setState((s) => setActive(s, id));
  }, []);

  return { state, saveAs, rename, save, remove, activate };
}
