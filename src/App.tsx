import { calculateCosts } from "./calc/costs";
import { scenarioStatus } from "./lib/scenarios";
import { AssumptionsForm } from "./ui/AssumptionsForm";
import { CostSummary } from "./ui/CostSummary";
import { ScenarioBar } from "./ui/ScenarioBar";
import { ScenarioCompare } from "./ui/ScenarioCompare";
import { useAssumptions } from "./ui/useAssumptions";
import { useScenarios } from "./ui/useScenarios";

function App() {
  const { assumptions, setField, load, reset, formKey } = useAssumptions();
  const scenarios = useScenarios();
  // Cheap to compute, so it simply reruns on every render.
  const summary = calculateCosts(assumptions);

  return (
    <main>
      <h1>Ski Program Cost Model</h1>
      <div className="layout">
        <CostSummary summary={summary} />
        <section aria-labelledby="assumptions-heading">
          <h2 id="assumptions-heading">Assumptions</h2>
          <ScenarioBar
            status={scenarioStatus(scenarios.state, assumptions)}
            onSave={() => scenarios.save(assumptions)}
            onSaveAs={(name) => scenarios.saveAs(name, assumptions)}
          />
          <AssumptionsForm
            key={formKey}
            assumptions={assumptions}
            onChange={setField}
            onReset={() => {
              reset();
              scenarios.activate(null);
            }}
          />
        </section>
      </div>
      <section aria-labelledby="scenarios-heading">
        <h2 id="scenarios-heading">Scenarios</h2>
        <ScenarioCompare
          current={assumptions}
          scenarios={scenarios.state.scenarios}
          onLoad={(s) => {
            load(s.assumptions);
            scenarios.activate(s.id);
          }}
          onRename={scenarios.rename}
          onDelete={scenarios.remove}
        />
      </section>
    </main>
  );
}

export default App;
