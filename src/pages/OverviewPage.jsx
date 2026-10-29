import TrendingPanel from '../components/TrendingPanel.jsx';
import { useMemo, useState } from 'react';
import { ArrowRight, ScanSearch, Layers, Shield, GitBranch, CirclePause, TriangleAlert } from '../components/Icons.js';
import EvidenceText from '../components/EvidenceText.jsx';
import RiskBand, { BandPill } from '../components/RiskBand.jsx';
import { analyzeMessage, MAX_INPUT_LENGTH } from '../utils/analyzer.js';
import { ILLUSTRATIVE_EXAMPLE } from '../data/sampleMessages.js';
import { ILLUSTRATIVE_HISTORY } from '../data/illustrativeHistory.js';
import { SCENARIOS } from '../data/scenarios/index.js';
import { formatDate } from '../utils/format.js';
import { navigate } from '../utils/useHashRoute.js';

const STAGES = [
  {
    num: '01',
    title: 'Inspect',
    icon: ScanSearch,
    text: 'Paste a message or upload a screenshot. Deterministic rules check it for known pressure and fraud patterns.',
  },
  {
    num: '02',
    title: 'Explain',
    icon: Layers,
    text: 'Manipulation X-Ray highlights the exact words that triggered each warning and explains the tactic behind them.',
  },
  {
    num: '03',
    title: 'Respond',
    icon: Shield,
    text: 'Get safe next steps, official reporting links and a report draft — or practise in the scam simulator.',
  },
];

export default function OverviewPage({ history, draft, setDraft, onAnalyze, onPause, storageMode = 'local' }) {
  const [error, setError] = useState('');
  const example = useMemo(() => analyzeMessage(ILLUSTRATIVE_EXAMPLE.text, { source: 'sample' }), []);
  const usingSampleRows = history.length === 0;
  const rows = usingSampleRows ? ILLUSTRATIVE_HISTORY : history.slice(0, 5);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.text.trim()) {
      setError('Paste or type a message first.');
      return;
    }
    setError('');
    onAnalyze(draft.text, draft.source);
  };

  return (
    <div className="page page--overview">
      <section className="hero">
        <div className="hero__text">
          <p className="eyebrow">Evidence-first scam triage · Prototype</p>
          <h1 className="display">Understand the message before you act.</h1>
          <p className="lede">
            JaalBreak inspects suspicious SMS, WhatsApp and email messages, shows you the exact words that may be
            pressuring or misleading you, and explains how to respond safely. It never asks for your OTP, PIN or
            password, and it works without any AI service.
          </p>
          <p className="tagline">See the manipulation. Understand the risk. Make the right move.</p>
        </div>

        <form className="panel hero__input" onSubmit={submit} noValidate>
          <label htmlFor="overview-input" className="panel__title">
            Paste a suspicious message
          </label>
          <textarea
            id="overview-input"
            className="textarea"
            rows={6}
            maxLength={MAX_INPUT_LENGTH}
            placeholder="For example: “Your account will be blocked today. Update KYC at…”"
            value={draft.text}
            onChange={(e) => {
              setDraft({ ...draft, text: e.target.value });
              if (error) setError('');
            }}
            aria-invalid={!!error}
            aria-describedby="overview-help"
          />
          <div className="input-meta" id="overview-help">
            {error ? (
              <span className="field-error" role="alert">
                <TriangleAlert size={14} aria-hidden="true" /> {error}
              </span>
            ) : (
              <span className="fine-print">Do not include OTPs, PINs or passwords. Your message is never uploaded.</span>
            )}
            <span className="counter">
              {draft.text.length.toLocaleString('en-IN')} / {MAX_INPUT_LENGTH.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="button-row">
            <button type="submit" className="btn btn--primary">
              Analyze Message <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button type="button" className="btn btn--ghost" onClick={() => navigate('analyze')}>
              Upload a screenshot instead
            </button>
          </div>
        </form>
      </section>

      <section className="stages" aria-label="How JaalBreak works">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          return (
            <div key={stage.num} className="stage">
              <div className="stage__head">
                <span className="stage__num">{stage.num}</span>
                <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
              </div>
              <h2 className="stage__title">{stage.title}</h2>
              <p className="stage__text">{stage.text}</p>
            </div>
          );
        })}
      </section>

      <section className="split">
        <div className="panel exhibit">
          <div className="panel__head">
            <p className="eyebrow">Exhibit · Illustrative example</p>
            <span className="tag">Fictional message</span>
          </div>
          <h2 className="panel__title panel__title--serif">How a fake internship offer applies pressure</h2>
          <div className="phone-quote">
            <EvidenceText text={example.text} signals={example.signals} interactive={false} />
          </div>
          <div className="exhibit__foot">
            <RiskBand band={example.band} size="sm" />
            <span className="muted">
              {example.matchedChecks} checks matched · {example.tactics.length} tactics
            </span>
          </div>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => onAnalyze(ILLUSTRATIVE_EXAMPLE.text, 'sample')}
          >
            Analyse this example <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="panel panel--navy sim-shortcut">
          <GitBranch size={22} strokeWidth={1.6} aria-hidden="true" />
          <p className="eyebrow eyebrow--inverse">What would you do?</p>
          <h2 className="panel__title panel__title--serif">Practise before real money is at risk.</h2>
          <p>
            Four branching scenarios let you make decisions, see the likely consequences and learn the tactic behind
            each pressure point.
          </p>
          <ul className="sim-shortcut__list">
            {SCENARIOS.map((s) => (
              <li key={s.id}>
                <a href={`#/simulator/${s.id}`}>
                  {s.title} <ArrowRight size={14} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn--inverse" onClick={onPause}>
            <CirclePause size={16} aria-hidden="true" /> I feel pressured right now
          </button>
        </div>
      </section>

      <section className="panel trending-home">
        <div className="panel__head">
          <h2 className="panel__title">What scammers are sending right now</h2>
          <a href="#/trends" className="btn btn--link">
            All trends <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
        <TrendingPanel days={7} limit={5} compact />
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <p className="eyebrow">Recent analyses</p>
            <h2 className="panel__title">{usingSampleRows ? 'What your history will look like' : 'Your latest checks'}</h2>
          </div>
          {usingSampleRows ? (
            <span className="tag tag--amber">Illustrative sample — not your data</span>
          ) : (
            <a href="#/history" className="btn btn--link">
              View all history <ArrowRight size={14} aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Category</th>
                <th scope="col">Assessment</th>
                <th scope="col" className="num hide-sm">
                  Checks
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="nowrap">{formatDate(r.date)}</td>
                  <td>{r.category}</td>
                  <td>
                    <BandPill bandKey={r.bandKey} label={r.band} />
                  </td>
                  <td className="num hide-sm">{r.matchedChecks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="fine-print">
          {storageMode === 'account'
            ? 'History is saved to your account as summaries only — never message text. You can delete it at any time from Analysis History.'
            : 'History is stored only in this browser. You can delete it at any time from Analysis History or Privacy & Method.'}
        </p>
      </section>
    </div>
  );
}
