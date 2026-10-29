import { ArrowRight } from '../components/Icons.js';
import PageHeader from '../components/PageHeader.jsx';
import ScenarioPlayer from '../components/ScenarioPlayer.jsx';
import TacticChip from '../components/TacticChip.jsx';
import { SCENARIOS, getScenario } from '../data/scenarios/index.js';

export default function SimulatorPage({ scenarioId }) {
  const scenario = scenarioId ? getScenario(scenarioId) : null;

  if (scenario) {
    return (
      <div className="page">
        <PageHeader eyebrow="Scam Journey Simulator · What would you do?" title={scenario.title} lede={scenario.objective} />
        {/* key resets the player when switching scenarios */}
        <ScenarioPlayer key={scenario.id} scenario={scenario} />
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Scam Journey Simulator · What would you do?"
        title="Practise the decision before it is real"
        lede="Each scenario is a short, fictional story with three decisions. Your choices change what happens next. There is no penalty for a risky choice — every outcome explains the pressure behind it."
      />
      <div className="scenario-grid">
        {SCENARIOS.map((s, i) => {
          const tactics = [...new Set(Object.values(s.steps).flatMap((step) => step.tactics))].slice(0, 4);
          return (
            <a key={s.id} href={`#/simulator/${s.id}`} className="scenario-card">
              <span className="scenario-card__num">Scenario {String(i + 1).padStart(2, '0')}</span>
              <h2 className="scenario-card__title">{s.title}</h2>
              <p className="scenario-card__pressure">
                <span className="mini-label">Pressure pattern</span>
                {s.pressure}
              </p>
              <p className="scenario-card__objective">
                <span className="mini-label">You will practise</span>
                {s.objective}
              </p>
              <div className="scenario-card__tactics">
                {tactics.map((t) => (
                  <TacticChip key={t} tactic={t} />
                ))}
              </div>
              <span className="scenario-card__cta">
                Start scenario <ArrowRight size={16} aria-hidden="true" />
              </span>
            </a>
          );
        })}
      </div>
      <p className="fine-print">
        All people, phone numbers, payment IDs and organisations in these scenarios are fictional. The simulator works
        offline and does not use any AI service.
      </p>
    </div>
  );
}
