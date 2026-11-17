import { calculateCosts } from "./calc/costs";
import { AssumptionsForm } from "./ui/AssumptionsForm";
import { CostSummary } from "./ui/CostSummary";
import { useAssumptions } from "./ui/useAssumptions";

function App() {
  const { assumptions, setField, reset, resetCount } = useAssumptions();
  // Cheap to compute, so it simply reruns on every render.
  const summary = calculateCosts(assumptions);

  return (
    <main>
      <h1>Ski Program Cost Model</h1>
      <div className="layout">
        <CostSummary summary={summary} />
        <section aria-labelledby="assumptions-heading">
          <h2 id="assumptions-heading">Assumptions</h2>
          <AssumptionsForm
            key={resetCount}
            assumptions={assumptions}
            onChange={setField}
            onReset={reset}
          />
        </section>
      </div>
    </main>
  );
}

export default App;
