import type { CostSummary as Summary } from "../calc/costs";
import { formatCurrency } from "../lib/formatCurrency";

/** The headline numbers from the Summary tab. */
export function CostSummary({ summary }: { summary: Summary }) {
  const rows = [
    { label: "Total cost", value: summary.totalCost },
    { label: "Cost per child", value: summary.costPerChild },
    { label: "Funding gap", value: summary.fundingGap },
  ];

  return (
    <section className="summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Cost summary</h2>
      <table>
        <tbody>
          {rows.map(({ label, value }) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{formatCurrency(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
