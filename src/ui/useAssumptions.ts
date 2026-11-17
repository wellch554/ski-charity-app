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
 * `formKey` goes up whenever the values are replaced from outside the form
 * (Load a scenario, Reset). The form uses it as its React `key`, so all
 * fields remount with the new values and drop any half-typed or invalid text.
 */
export function useAssumptions() {
  const [assumptions, setAssumptions] = useState<Assumptions>(() =>
    loadAssumptions(window.localStorage),
  );
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    saveAssumptions(window.localStorage, assumptions);
  }, [assumptions]);

  const setField = useCallback((key: AssumptionKey, value: number) => {
    setAssumptions((prev) => ({ ...prev, [key]: value }));
  }, []);

  /** Replace every value, e.g. when loading a scenario. */
  const load = useCallback((values: Assumptions) => {
    setAssumptions({ ...values });
    setFormKey((n) => n + 1);
  }, []);

  const reset = useCallback(() => {
    // The effect above then saves the defaults; clearing first means nothing
    // stale is left behind even if that save fails.
    clearAssumptions(window.localStorage);
    load(DEFAULT_ASSUMPTIONS);
  }, [load]);

  return { assumptions, setField, load, reset, formKey };
}
