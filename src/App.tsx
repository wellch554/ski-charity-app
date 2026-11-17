import { calculateCosts } from "./calc/costs";
import { DEFAULT_ASSUMPTIONS } from "./calc/defaults";
import { formatCurrency } from "./lib/formatCurrency";

// Inputs are fixed defaults for now, so this is computed once. When the
// Assumptions form arrives, it moves into the component and uses state.
const summary = calculateCosts(DEFAULT_ASSUMPTIONS);

const rows = [
  { label: "Total cost", value: summary.totalCost },
  { label: "Cost per child", value: summary.costPerChild },
  { label: "Funding gap", value: summary.fundingGap },
];

function App() {
  return (
    <main>
      <h1>Ski Program Cost Model</h1>
      <h2>Cost summary</h2>
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
    </main>
  );
}

export default App;
