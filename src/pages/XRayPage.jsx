import { useEffect, useState } from 'react';
import { Layers, CircleCheck, ShieldCheck, ArrowRight, Info } from '../components/Icons.js';
import PageHeader from '../components/PageHeader.jsx';
import EvidenceText from '../components/EvidenceText.jsx';
import RiskBand from '../components/RiskBand.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ILLUSTRATIVE_EXAMPLE } from '../data/sampleMessages.js';
import { navigate } from '../utils/useHashRoute.js';

const SEVERITY_LABEL = { 3: 'Strong signal', 2: 'Moderate signal', 1: 'Weak signal' };

export default function XRayPage({ analysis, selectedFromUrl, onAnalyzeExample }) {
  const firstId = analysis && analysis.signals.length ? analysis.signals[0].id : null;
  const [selectedId, setSelectedId] = useState(selectedFromUrl || firstId);

  // When a new analysis arrives or the URL names a phrase, select it.
  useEffect(() => {
    const exists = analysis && analysis.signals.some((s) => s.id === selectedFromUrl);
    setSelectedId(exists ? selectedFromUrl : firstId);
  }, [analysis, selectedFromUrl, firstId]);

  if (!analysis) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Manipulation X-Ray"
          title="See exactly which words are doing the pushing"
          lede="X-Ray highlights only phrases that genuinely appear in the message you analysed, and explains the tactic behind each one."
        />
        <EmptyState
          icon={Layers}
          title="No message analysed yet"
          actions={
            <>
              <button type="button" className="btn btn--primary" onClick={() => navigate('analyze')}>
                Analyse a message <ArrowRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  onAnalyzeExample(ILLUSTRATIVE_EXAMPLE.text, 'sample');
                  navigate('xray');
                }}
              >
                Use the illustrative example
              </button>
            </>
          }
        >
          <p>Run an analysis first. X-Ray will then show your message with each piece of evidence highlighted.</p>
        </EmptyState>
      </div>
    );
  }

  const selected = analysis.signals.find((s) => s.id === selectedId) || null;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Manipulation X-Ray"
        title="See exactly which words are doing the pushing"
        lede="Select a highlighted phrase to see the tactic it may be using, why it is concerning, and what to do instead."
      >
        <RiskBand band={analysis.band} size="sm" />
      </PageHeader>

      {analysis.signals.length === 0 ? (
        <div className="xray xray--empty">
          <div className="panel">
            <p className="mini-label">Message inspected</p>
            <div className="evidence-text evidence-text--plain">{analysis.text}</div>
          </div>
          <EmptyState icon={ShieldCheck} title="No phrases matched our warning patterns">
            <p>
              We found nothing to highlight. That is not a guarantee of safety: the rules only recognise known patterns,
              and we cannot confirm who sent the message.
            </p>
            <p>If the message was unexpected, verify it through the official app or a website you type yourself.</p>
          </EmptyState>
        </div>
      ) : (
        <div className="xray">
          <div className="xray__message panel">
            <div className="panel__head">
              <p className="mini-label">Message under inspection</p>
              <span className="panel__meta">
                {analysis.signals.length} highlighted phrase{analysis.signals.length === 1 ? '' : 's'}
              </span>
            </div>
            <EvidenceText
              text={analysis.text}
              signals={analysis.signals}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            <div className="legend" aria-label="Highlight legend">
              <span>
                <i className="legend__swatch mark--sev3" /> Strong
              </span>
              <span>
                <i className="legend__swatch mark--sev2" /> Moderate
              </span>
              <span>
                <i className="legend__swatch mark--sev1" /> Weak
              </span>
            </div>

            <div className="xray__list">
              <p className="mini-label">All findings</p>
              <ol>
                {analysis.signals.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={`finding ${s.id === selectedId ? 'is-selected' : ''}`}
                      onClick={() => setSelectedId(s.id)}
                    >
                      <span className={`finding__dot sev-${s.severity}`} aria-hidden="true" />
                      <q>{s.quote}</q>
                      <span className="finding__tactic">{s.tacticShort}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <aside className="xray__detail" aria-live="polite">
            {selected ? (
              <div className="panel detail-card">
                <p className="eyebrow">Evidence {analysis.signals.indexOf(selected) + 1} of {analysis.signals.length}</p>
                <blockquote className="detail-card__quote">“{selected.quote}”</blockquote>

                <dl className="detail-card__rows">
                  <div>
                    <dt>Suspected tactic</dt>
                    <dd>
                      <strong>{selected.tacticLabel}</strong>
                      <span className={`weight weight--${selected.severity}`}>{SEVERITY_LABEL[selected.severity]}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Why this wording may be concerning</dt>
                    <dd>{selected.why}</dd>
                  </div>
                  {selected.linkReasons && selected.linkReasons.length > 0 && (
                    <div>
                      <dt>What we noticed about this link</dt>
                      <dd>
                        <ul className="bullet-list">
                          {selected.linkReasons.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                        <p className="fine-print">We did not open or visit this link.</p>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt>What to do instead</dt>
                    <dd>{selected.doInstead}</dd>
                  </div>
                </dl>

                <div className="verified">
                  <CircleCheck size={16} aria-hidden="true" />
                  <p>
                    <strong>Verified quote.</strong> This exact text appears in your message at characters{' '}
                    {selected.start + 1}–{selected.end}.
                  </p>
                </div>
                <p className="rule-ref">
                  Rule <code>{selected.ruleId}</code> · {selected.description}
                </p>
              </div>
            ) : (
              <div className="panel">
                <p className="muted">Select a highlighted phrase to see its explanation.</p>
              </div>
            )}

            <div className="callout callout--neutral">
              <Info size={16} aria-hidden="true" />
              <p>
                Highlights come from deterministic rules (rules-only mode, no AI). Each quote is checked against your
                original text before it is shown; anything that cannot be matched is discarded.
                {analysis.discardedQuotes > 0 ? ` ${analysis.discardedQuotes} unverifiable quote(s) were discarded.` : ''}
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
