import { useId, useState } from "react";
import type { FieldDef } from "../lib/assumptionFields";
import { formatFieldValue, parseField } from "../lib/assumptionsInput";

interface Props {
  field: FieldDef;
  value: number;
  onChange: (value: number) => void;
}

/**
 * One labelled input. It keeps the raw text the user typed ("draft"), so an
 * invalid entry like "-3" stays visible with a message while the model keeps
 * the last valid value. Only valid values are passed to onChange.
 *
 * `value` is only read on first render; the form is remounted on reset (see
 * useAssumptions), which is how the field picks up new defaults.
 */
export function NumberField({ field, value, onChange }: Props) {
  const [draft, setDraft] = useState(() => formatFieldValue(value, field.kind));
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const errorId = `${id}-error`;

  function handleChange(text: string) {
    setDraft(text);
    const result = parseField(text, field.kind);
    if (result.ok) {
      setError(null);
      onChange(result.value);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="field">
      <label htmlFor={id}>{field.label}</label>
      <input
        id={id}
        type="text"
        inputMode={field.kind === "count" ? "numeric" : "decimal"}
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        aria-invalid={error !== null}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
