import { useId, useState } from "react";
import { type CostSummary, calculateCosts } from "../calc/costs";
import type { Assumptions } from "../calc/defaults";
import { formatCurrency } from "../lib/formatCurrency";
import type { NameResult, Scenario } from "../lib/scenarios";

interface Props {
  current: Assumptions;
  scenarios: Scenario[];
  onLoad: (scenario: Scenario) => void;
  onRename: (id: string, name: string) => NameResult;
  onDelete: (id: string) => void;
}

const ROWS: { label: string; value: (s: CostSummary) => number }[] = [
  { label: "Total cost", value: (s) => s.totalCost },
  { label: "Cost per child", value: (s) => s.costPerChild },
  { label: "Cost per child-day", value: (s) => s.costPerChildDay },
  { label: "Funding gap", value: (s) => s.fundingGap },
];

/**
 * Side-by-side table: the live form ("Current") and then every saved
 * scenario, with Load / Rename / Delete under each scenario.
 */
export function ScenarioCompare({
  current,
  scenarios,
  onLoad,
  onRename,
  onDelete,
}: Props) {
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const columns = [
    { id: null, name: "Current", summary: calculateCosts(current) },
    ...scenarios.map((s) => ({
      id: s.id,
      name: s.name,
      summary: calculateCosts(s.assumptions),
    })),
  ];

  function handleDelete(scenario: Scenario) {
    if (window.confirm(`Delete scenario "${scenario.name}"?`)) {
      onDelete(scenario.id);
    }
  }

  return (
    // Scrolls sideways when there are more columns than fit.
    <div className="table-scroll">
      <table className="compare" aria-label="Scenario comparison">
        <thead>
          <tr>
            <td />
            {columns.map((col) => (
              <th key={col.id ?? "current"} scope="col">
                {col.id !== null && col.id === renamingId ? (
                  <RenameForm
                    name={col.name}
                    onSubmit={(name) => {
                      const result = onRename(col.id, name);
                      if (result.ok) setRenamingId(null);
                      return result;
                    }}
                    onCancel={() => setRenamingId(null)}
                  />
                ) : (
                  col.name
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {columns.map((col) => (
                <td key={col.id ?? "current"}>
                  {formatCurrency(row.value(col.summary))}
                </td>
              ))}
            </tr>
          ))}
          <tr className="actions">
            <td />
            <td />
            {scenarios.map((s) => (
              <td key={s.id}>
                <button
                  type="button"
                  className="btn-small"
                  aria-label={`Load ${s.name}`}
                  onClick={() => onLoad(s)}
                >
                  Load
                </button>
                <button
                  type="button"
                  className="btn-small"
                  aria-label={`Rename ${s.name}`}
                  onClick={() => setRenamingId(s.id)}
                >
                  Rename
                </button>
                <button
                  type="button"
                  className="btn-small btn-danger"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => handleDelete(s)}
                >
                  Delete
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

interface RenameProps {
  name: string;
  onSubmit: (name: string) => NameResult;
  onCancel: () => void;
}

/** Inline rename inside a column header. Enter saves, Escape cancels. */
function RenameForm({ name, onSubmit, onCancel }: RenameProps) {
  const [draft, setDraft] = useState(name);
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const errorId = `${id}-error`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = onSubmit(draft);
    if (!result.ok) setError(result.error);
  }

  return (
    <form className="rename" onSubmit={handleSubmit}>
      <label htmlFor={id} className="visually-hidden">
        New name for {name}
      </label>
      <input
        id={id}
        type="text"
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onCancel()}
        aria-invalid={error !== null}
        aria-describedby={error ? errorId : undefined}
      />
      <button type="submit" className="btn-primary">
        Save name
      </button>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      {error && (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
