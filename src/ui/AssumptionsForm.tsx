import type { Assumptions } from "../calc/defaults";
import {
  type AssumptionKey,
  ASSUMPTION_SECTIONS,
} from "../lib/assumptionFields";
import { NumberField } from "./NumberField";

interface Props {
  assumptions: Assumptions;
  onChange: (key: AssumptionKey, value: number) => void;
  onReset: () => void;
}

/** The Assumptions tab: one fieldset per spreadsheet section. */
export function AssumptionsForm({ assumptions, onChange, onReset }: Props) {
  return (
    // Fields update live, so there is nothing to submit.
    <form className="assumptions" onSubmit={(e) => e.preventDefault()}>
      {ASSUMPTION_SECTIONS.map((section) => (
        <fieldset key={section.title}>
          <legend>{section.title}</legend>
          {section.fields.map((field) => (
            <NumberField
              key={field.key}
              field={field}
              value={assumptions[field.key]}
              onChange={(value) => onChange(field.key, value)}
            />
          ))}
        </fieldset>
      ))}
      <button type="button" onClick={onReset}>
        Reset to defaults
      </button>
    </form>
  );
}
