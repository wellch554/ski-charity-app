import { useId, useState } from "react";
import type { NameResult, ScenarioStatus } from "../lib/scenarios";

interface Props {
  status: ScenarioStatus;
  onSave: () => void;
  /** Returns the validation result so an invalid name can be shown. */
  onSaveAs: (name: string) => NameResult;
}

/** Which scenario the form holds, plus Save and Save As. */
export function ScenarioBar({ status, onSave, onSaveAs }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const errorId = `${id}-error`;

  const canSave = status.kind === "loaded" && status.edited;
  const statusText =
    status.kind === "none"
      ? "Scenario: none"
      : `Scenario: ${status.name}${status.edited ? " (edited)" : ""}`;

  function handleSaveAs(e: React.FormEvent) {
    e.preventDefault();
    const result = onSaveAs(name);
    if (result.ok) {
      setName("");
      setError(null);
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="scenario-bar">
      <p
        role="status"
        className="scenario-status"
        data-state={
          status.kind === "none" ? "none" : status.edited ? "edited" : "loaded"
        }
      >
        {statusText}
      </p>
      <button
        type="button"
        className="btn-primary"
        onClick={onSave}
        disabled={!canSave}
      >
        Save
      </button>
      <form className="save-as" onSubmit={handleSaveAs}>
        <label htmlFor={id}>Scenario name</label>
        <input
          id={id}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-invalid={error !== null}
          aria-describedby={error ? errorId : undefined}
        />
        <button type="submit" className="btn-primary">
          Save as
        </button>
        {error && (
          <p id={errorId} className="field-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
