import { useCallback, useEffect, useState } from "react";
import { type Assumptions, DEFAULT_ASSUMPTIONS } from "../calc/defaults";
import type { AssumptionKey } from "../lib/assumptionFields";
import {
  clearAssumptions,
  loadAssumptions,
  saveAssumptions,
} from "../lib/assumptionsInput";

/**
 * The current assumptions, restored from localStorage on first render and
 * saved again whenever they change.
 *
 * `resetCount` goes up on every reset. The form uses it as its React `key`,
 * so all fields remount and drop any half-typed or invalid text.
 */
export function useAssumptions() {
  const [assumptions, setAssumptions] = useState<Assumptions>(() =>
    loadAssumptions(window.localStorage),
  );
  const [resetCount, setResetCount] = useState(0);

  useEffect(() => {
    saveAssumptions(window.localStorage, assumptions);
  }, [assumptions]);

  const setField = useCallback((key: AssumptionKey, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    // The effect above then saves the defaults; clearing first means nothing
    // stale is left behind even if that save fails.
    clearAssumptions(window.localStorage);
    setAssumptions({ ...DEFAULT_ASSUMPTIONS });
    setResetCount((n) => n + 1);
  }, []);

  return { assumptions, setField, reset, resetCount };
}
