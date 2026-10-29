// ---------------------------------------------------------------------------
// Plays one branching scenario: situation → choice → consequence → next step,
// then a learning summary. All content comes from src/data/scenarios/.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  RotateCcw,
  CircleCheck,
  TriangleAlert,
  CircleX,
  MessageSquare,
  ListChecks,
} from './Icons.js';
import TacticChip from './TacticChip.jsx';
import { RATINGS, buildLearningSummary } from '../utils/scenarioEngine.js';
import { navigate } from '../utils/useHashRoute.js';

const RATING_ICON = { safer: CircleCheck, caution: TriangleAlert, risky: CircleX };

function countDecisions(scenario) {
  // Longest path length, for the "Decision x of y" label.
  const depth = (id) => {
    const step = scenario.steps[id];
    return 1 + Math.max(...step.choices.map((c) => (c.next ? depth(c.next) : 0)));
  };
  return depth(scenario.start);
}

function MessageCard({ message }) {
  if (!message) return null;
  return (
    <div className="sim-message">
      <div className="sim-message__head">
        <MessageSquare size={15} aria-hidden="true" />
        <span className="sim-message__channel">{message.channel}</span>
        <span className="sim-message__from">{message.from}</span>
      </div>
      <p className="sim-message__text">{message.text}</p>
      <p className="sim-message__note">Fictional message for training</p>
    </div>
  );
}

function Summary({ scenario, path, onRestart }) {
  const summary = buildLearningSummary(scenario, path);
  const tone = summary.ending ? summary.ending.tone : 'partial';
  return (
    <div className="sim-summary">
      <div className={`sim-ending sim-ending--${tone}`}>
        <p className="eyebrow">Scenario complete</p>
        <h2 className="section-title">{summary.ending ? summary.ending.title : 'Scenario complete'}</h2>
        {summary.ending && <p className="lede">{summary.ending.summary}</p>}
        <div className="sim-score">
          <span className="sim-score__num">
            {summary.saferCount}
            <small> / {summary.totalDecisions}</small>
          </span>
          <span className="sim-score__label">safer decisions</span>
        </div>
      </div>

      <div className="sim-summary__grid">
        <div className="panel">
          <h3 className="panel__title">Tactics you encountered</h3>
          <ul className="tactic-list">
            {summary.tactics.map((t) => (
              <li key={t.key}>
                <strong>{t.label}</strong>
                <span>{t.why}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="panel">
          <h3 className="panel__title">Your decisions</h3>
          <ol className="decision-list">
            {summary.decisions.map(({ step, choice }) => {
              const Icon = RATING_ICON[choice.rating];
              return (
                <li key={`${step.stage}-${choice.id}`} className={`decision decision--${choice.rating}`}>
                  <Icon size={16} aria-hidden="true" />
                  <div>
                    <p className="decision__label">{choice.label}</p>
                    <p className="decision__rating">{RATINGS[choice.rating].label}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <h3 className="panel__title panel__title--spaced">Warning signs to watch for</h3>
          {summary.missedSigns.length === 0 ? (
            <p className="muted">You acted on every warning sign in this run. Well spotted.</p>
          ) : (
            <ul className="bullet-list">
              {summary.missedSigns.map((sign) => (
                <li key={sign}>{sign}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel panel--accent">
          <h3 className="panel__title">
            <ListChecks size={18} aria-hidden="true" /> Remember this checklist
          </h3>
          <ul className="checklist">
            {summary.checklist.map((item) => (
              <li key={item}>
                <CircleCheck size={15} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="button-row">
        <button type="button" className="btn btn--primary" onClick={onRestart}>
          <RotateCcw size={16} aria-hidden="true" /> Restart this scenario
        </button>
        <button type="button" className="btn btn--secondary" onClick={() => navigate('simulator')}>
          Choose another scenario
        </button>
      </div>
    </div>
  );
}

export default function ScenarioPlayer({ scenario }) {
  const [stepId, setStepId] = useState(scenario.start);
  const [path, setPath] = useState([]); // [{ stepId, choiceId }]
  const [pending, setPending] = useState(null); // the choice just made, awaiting "Continue"
  const [finished, setFinished] = useState(false);

  const total = countDecisions(scenario);
  const step = scenario.steps[stepId];

  const restart = () => {
    setStepId(scenario.start);
    setPath([]);
    setPending(null);
    setFinished(false);
    window.scrollTo(0, 0);
  };

  const choose = (choice) => {
    if (pending) return;
    setPending(choice);
    setPath((p) => [...p, { stepId, choiceId: choice.id }]);
  };

  const proceed = () => {
    if (!pending) return;
    if (pending.end) {
      setFinished(true);
    } else {
      setStepId(pending.next);
    }
    setPending(null);
    window.scrollTo(0, 0);
  };

  if (finished) return <Summary scenario={scenario} path={path} onRestart={restart} />;

  const RatingIcon = pending ? RATING_ICON[pending.rating] : null;

  return (
    <div className="sim-player">
      <div className="sim-progress">
        <button type="button" className="btn btn--link" onClick={() => navigate('simulator')}>
          <ChevronLeft size={16} aria-hidden="true" /> All scenarios
        </button>
        <div className="sim-progress__track" aria-label={`Decision ${path.length + (pending ? 0 : 1)} of up to ${total}`}>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={i < path.length ? 'is-done' : i === path.length ? 'is-current' : ''} />
          ))}
        </div>
        <span className="sim-progress__label">
          Decision {Math.min(step.stage, total)} of {total}
        </span>
      </div>

      <div className="sim-stage">
        <div className="sim-stage__story">
          {path.length === 0 && <p className="sim-persona">{scenario.persona}</p>}
          <p className="sim-situation">{step.situation}</p>
          <MessageCard message={step.message} />
        </div>

        <div className="sim-stage__decide">
          <h2 className="sim-question">{step.question}</h2>
          <div className="choice-list" role="group" aria-label="Choices">
            {step.choices.map((choice, i) => {
              const chosen = pending && pending.id === choice.id;
              return (
                <button
                  key={choice.id}
                  type="button"
                  className={`choice ${chosen ? `is-chosen choice--${choice.rating}` : ''} ${pending && !chosen ? 'is-dimmed' : ''}`}
                  onClick={() => choose(choice)}
                  disabled={!!pending}
                >
                  <span className="choice__key">{String.fromCharCode(65 + i)}</span>
                  <span>{choice.label}</span>
                </button>
              );
            })}
          </div>

          {pending && (
            <div className={`feedback feedback--${pending.rating}`} role="status" aria-live="polite">
              <p className="feedback__rating">
                <RatingIcon size={18} aria-hidden="true" /> {RATINGS[pending.rating].label}
              </p>
              <p className="feedback__consequence">{pending.consequence}</p>
              <p className="feedback__why">
                <strong>Why: </strong>
                {pending.explanation}
              </p>
              <div className="feedback__tactics">
                <span className="mini-label">Tactic{pending.tactics.length > 1 ? 's' : ''} at play</span>
                {pending.tactics.map((t) => (
                  <TacticChip key={t} tactic={t} full />
                ))}
              </div>
              <p className="feedback__next">
                <strong>Next action: </strong>
                {pending.nextAction}
              </p>
              <button type="button" className="btn btn--primary" onClick={proceed} autoFocus>
                {pending.end ? 'See your learning summary' : 'Continue'} <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
