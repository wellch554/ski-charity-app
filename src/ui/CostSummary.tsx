import type { CostSummary as Summary } from "../calc/costs";
import { formatCurrency } from "../lib/formatCurrency";

/**
 * Whether the gap still needs raising. Uses the displayed (whole-dollar)
 * amount, so a tiny float like 0.3 that shows as "$0" counts as funded.
 * Display only; nothing here feeds back into calculations.
 */
function gapTone(gap: number) {
  const shown = Math.round(gap);
  if (shown > 0) return { tone: "gap", note: "to raise" };
  if (shown < 0) return { tone: "surplus", note: "surplus" };
  return { tone: "surplus", note: "fully funded" };
}

/** The headline numbers from the Summary tab. */
export function CostSummary({ summary }: { summary: Summary }) {
  const gap = gapTone(summary.fundingGap);
  const rows: {
    label: string;
    value: number;
    tone?: string;
    note?: string;
  }[] = [
    { label: "Total cost", value: summary.totalCost },
    { label: "Cost per child", value: summary.costPerChild },
    { label: "Funding gap", value: summary.fundingGap, ...gap },
  ];

  return (
    <section className="summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Cost summary</h2>
      <table>
        <tbody>
          {rows.map(({ label, value, tone, note }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td data-tone={tone}>
                {formatCurrency(value)}
                {note && <span className="tone-note">{note}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
