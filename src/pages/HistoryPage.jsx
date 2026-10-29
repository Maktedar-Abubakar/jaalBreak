import { useMemo, useState } from 'react';
import { Search, Trash2, Eye, X, History as HistoryIcon, Layers, Lock, Cloud, LoaderCircle } from '../components/Icons.js';
import { historyToCsv, historyToPrintableHtml, downloadFile } from '../utils/historyExport.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { BandPill } from '../components/RiskBand.jsx';
import { formatDateTime, SOURCE_LABELS } from '../utils/format.js';

const FILTERS = [
  { value: 'all', label: 'All assessments' },
  { value: 'high', label: 'Strong match' },
  { value: 'medium', label: 'Several warning signs' },
  { value: 'low', label: 'Few warning signs' },
];

export default function HistoryPage({
  history,
  settings,
  onDelete,
  onClearAll,
  onOpen,
  storageMode = 'local',
  cloudStatus = 'idle',
  importableCount = 0,
  onImportLocal,
}) {
  const isAccount = storageMode === 'account';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewing, setViewing] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importedCount, setImportedCount] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((r) => {
      if (filter !== 'all' && r.bandKey !== filter) return false;
      if (!q) return true;
      const haystack = [r.category, r.band, ...(r.tactics || []), r.text || '', r.language || '']
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [history, query, filter]);

  const viewingRecord = viewing ? history.find((r) => r.id === viewing) : null;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Analysis History"
        title="Your recent checks"
        lede={
          isAccount
            ? 'Saved to your JaalBreak account, so it follows you when you sign in on another device. Only you can see it. You can delete one record or everything.'
            : 'Guest mode: stored only in this browser (localStorage). It is not encrypted, not synced and not sent anywhere, and it is lost if you clear your browser data. You can delete one record or everything.'
        }
      >
        {history.length > 0 && (
          <div className="button-row">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => downloadFile('jaalbreak-history.csv', historyToCsv(history), 'text/csv;charset=utf-8')}>
              Export CSV
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => {
                const w = window.open('', '_blank');
                if (w) {
                  w.document.write(historyToPrintableHtml(history));
                  w.document.close();
                }
              }}
            >
              Save as PDF
            </button>
          </div>
        )}
      </PageHeader>

      <div className="callout callout--neutral history-note">
        {isAccount ? <Cloud size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
        <p>
          {!settings.saveHistory
            ? 'History saving is turned off. New analyses are not recorded.'
            : isAccount
              ? 'Saving to your account: summaries only — date, category, assessment and tactic names. Message text, screenshots and links are never stored in your account.'
              : settings.saveFullText
                ? 'Saving in this browser: summaries and full message text (you opted in).'
                : 'Saving in this browser: summaries only — date, category, assessment and tactic names. Full message text is not stored.'}{' '}
          <a href="#/privacy" className="inline-link">
            Change in Privacy &amp; Method
          </a>
        </p>
      </div>

      {importedCount !== null ? (
        <div className="callout callout--info" role="status">
          <Cloud size={16} aria-hidden="true" />
          <p>
            Copied {importedCount} record{importedCount === 1 ? '' : 's'} to your account and removed{' '}
            {importedCount === 1 ? 'it' : 'them'} from this browser.{' '}
            <button type="button" className="btn btn--link auth-inline-btn" onClick={() => setImportedCount(null)}>
              Dismiss
            </button>
          </p>
        </div>
      ) : (
        importableCount > 0 &&
        onImportLocal && (
          <ImportLocal
            count={importableCount}
            onImport={async () => {
              const n = await onImportLocal();
              setImportedCount(n);
            }}
          />
        )
      )}

      {isAccount && cloudStatus === 'loading' && history.length === 0 ? (
        <div className="panel muted center">
          <LoaderCircle size={18} className="spin" aria-hidden="true" /> Loading your history…
        </div>
      ) : isAccount && cloudStatus === 'offline' && history.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="Couldn’t load your history">
          <p>Check your connection and refresh the page. Analysis still works; new checks will save when you’re back online.</p>
        </EmptyState>
      ) : null}

      {(isAccount && cloudStatus !== 'ready' && history.length === 0) ? null : history.length === 0 ? (
        <EmptyState icon={HistoryIcon} title="No analyses stored yet">
          <p>When you analyse a message, a summary will appear here (unless you turn history off).</p>
        </EmptyState>
      ) : (
        <section className="panel">
          <div className="toolbar">
            <label className="search">
              <Search size={16} aria-hidden="true" />
              <span className="visually-hidden">Search history</span>
              <input
                type="search"
                placeholder="Search category, tactic or text…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="field field--inline">
              <span className="field__label">Risk</span>
              <select className="select" value={filter} onChange={(e) => setFilter(e.target.value)}>
                {FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
            <span className="toolbar__count">
              {filtered.length} of {history.length} record{history.length === 1 ? '' : 's'}
            </span>
            <div className="toolbar__end">
              {confirmClear ? (
                <span className="confirm">
                  Delete all {history.length} records?
                  <button
                    type="button"
                    className="btn btn--danger btn--sm"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                      setViewing(null);
                    }}
                  >
                    Yes, delete all
                  </button>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => setConfirmClear(false)}>
                    Cancel
                  </button>
                </span>
              ) : (
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setConfirmClear(true)}>
                  <Trash2 size={15} aria-hidden="true" /> Delete all
                </button>
              )}
            </div>
          </div>

          <div className="table-wrap">
            <table className="table table--interactive">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Message category</th>
                  <th scope="col">Assessment</th>
                  <th scope="col" className="num hide-sm">
                    Checks
                  </th>
                  <th scope="col" className="hide-sm">
                    Input
                  </th>
                  <th scope="col" className="actions-col">
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted center">
                      No records match your search or filter.
                    </td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className={viewing === r.id ? 'is-selected' : ''}>
                    <td className="nowrap">{formatDateTime(r.date)}</td>
                    <td>{r.category}</td>
                    <td>
                      <BandPill bandKey={r.bandKey} label={r.band} />
                    </td>
                    <td className="num hide-sm">{r.matchedChecks}</td>
                    <td className="hide-sm">{SOURCE_LABELS[r.source] || '—'}</td>
                    <td className="actions-col">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => setViewing(r.id)}
                        aria-label="View details"
                        title="View details"
                      >
                        <Eye size={17} />
                      </button>
                      <button
                        type="button"
                        className="icon-button icon-button--danger"
                        disabled={r.pending}
                        onClick={() => {
                          onDelete(r.id);
                          if (viewing === r.id) setViewing(null);
                        }}
                        aria-label="Delete record"
                        title="Delete record"
                      >
                        <Trash2 size={17} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {viewingRecord && (
        <section className="panel record-detail" aria-label="Record details">
          <div className="panel__head">
            <div>
              <p className="eyebrow">Record details</p>
              <h2 className="panel__title">{viewingRecord.category}</h2>
            </div>
            <button type="button" className="icon-button" onClick={() => setViewing(null)} aria-label="Close details">
              <X size={18} />
            </button>
          </div>
          <dl className="facts facts--wide">
            <div>
              <dt>Date</dt>
              <dd>{formatDateTime(viewingRecord.date)}</dd>
            </div>
            <div>
              <dt>Assessment</dt>
              <dd>
                <BandPill bandKey={viewingRecord.bandKey} label={viewingRecord.band} />
              </dd>
            </div>
            <div>
              <dt>Matched checks</dt>
              <dd>{viewingRecord.matchedChecks}</dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>{viewingRecord.language || '—'}</dd>
            </div>
            <div>
              <dt>Input</dt>
              <dd>{SOURCE_LABELS[viewingRecord.source] || '—'}</dd>
            </div>
            <div>
              <dt>Rules version</dt>
              <dd>{viewingRecord.rulesVersion || '—'}</dd>
            </div>
          </dl>
          <p className="mini-label">Tactics detected</p>
          {viewingRecord.tactics && viewingRecord.tactics.length ? (
            <div className="chip-row">
              {viewingRecord.tactics.map((t) => (
                <span key={t} className="tactic-chip">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">None</p>
          )}

          {viewingRecord.hasText ? (
            <>
              <p className="mini-label">Stored message text</p>
              <div className="evidence-text evidence-text--plain">{viewingRecord.text}</div>
              <button type="button" className="btn btn--primary" onClick={() => onOpen(viewingRecord)}>
                <Layers size={16} aria-hidden="true" /> Re-open in Manipulation X-Ray
              </button>
            </>
          ) : (
            <p className="fine-print">
              The full message text was not stored for this record (summary-only mode), so it cannot be re-opened in
              X-Ray.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

/** Offer — never automatic — to copy guest history from this browser into the account. */
function ImportLocal({ count, onImport }) {
  const [step, setStep] = useState('offer'); // offer | confirm | busy | hidden
  const [error, setError] = useState('');
  if (step === 'hidden') return null;

  const run = async () => {
    setStep('busy');
    setError('');
    try {
      await onImport(); // the parent shows the "Copied" message
    } catch (err) {
      setError(err.message);
      setStep('confirm');
    }
  };

  return (
    <div className="callout callout--neutral import-local">
      <HistoryIcon size={16} aria-hidden="true" />
      <div>
        <p>
          This browser also has <strong>{count}</strong> guest record{count === 1 ? '' : 's'} from before you signed in.{' '}
          {count === 1 ? 'It is' : 'They are'} <strong>not</strong> in your account.
        </p>
        {step === 'offer' && (
          <div className="button-row">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setStep('confirm')}>
              Copy them to my account…
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep('hidden')}>
              Not now
            </button>
          </div>
        )}
        {(step === 'confirm' || step === 'busy') && (
          <>
            <p className="fine-print">
              Only summaries are copied (date, category, assessment, tactic names) — never message text. After copying,
              they are removed from this browser’s guest history.
            </p>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <div className="button-row">
              <button type="button" className="btn btn--primary btn--sm" onClick={run} disabled={step === 'busy'}>
                {step === 'busy' ? 'Copying…' : `Yes, copy ${count} record${count === 1 ? '' : 's'}`}
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setStep('offer')} disabled={step === 'busy'}>
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
