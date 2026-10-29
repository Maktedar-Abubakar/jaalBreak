import { useState } from 'react';
import { Lock, Trash2, CircleCheck, CircleX } from '../components/Icons.js';
import PageHeader from '../components/PageHeader.jsx';
import { RULES, CATEGORY_LABELS } from '../data/rules.js';
import { getTactic } from '../data/tactics.js';
import { THRESHOLDS, RULES_VERSION, MAX_INPUT_LENGTH } from '../utils/analyzer.js';
import { TRUST_STATEMENT } from '../data/officialResources.js';

const LANG_LABEL = { en: 'English', hi: 'Hindi', hinglish: 'Hinglish' };

const DOES = [
  'Checks text against fixed, reviewed rules in your browser.',
  'Highlights only phrases that exist in your message.',
  'Reads screenshots in your browser with OCR, then lets you correct the text.',
  'Stores history summaries — in this browser for guests, or in your account when signed in — only if you allow it.',
  'Never stores message text, screenshots or links in your account.',
  'Decodes QR codes and reads PDFs in your browser — the files never leave your device.',
  'Shares a scam with the community ONLY when you press "Share anonymously": just the scam type, risk level, tactic names, language and channel. Individual reports cannot be read back by anyone; only totals are shown.',
  '"Ask family" and "Read aloud" use your own WhatsApp and your device\'s voices. JaalBreak sends nothing itself.',
  'Offers an API (/api/check) for other apps: text sent to it is checked in memory and not stored.',
];

const DOES_NOT = [
  'Use an AI model to decide the verdict (this build is rules-only).',
  'Open, visit or verify links.',
  'Intercept, record or answer real calls.',
  'Collect or ask for credentials, OTPs or PINs.',
  'Monitor your stress or any biometric signal.',
  'Block, lock or control banking or UPI apps.',
  'Decide whether a receipt or payment screenshot is genuine.',
  'File complaints, contact police or recover money.',
];

function Toggle({ id, checked, onChange, label, description }) {
  return (
    <div className="toggle-row">
      <div>
        <label htmlFor={id} className="toggle-row__label">
          {label}
        </label>
        <p className="toggle-row__desc">{description}</p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        className={`switch ${checked ? 'is-on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
        <span className="visually-hidden">{checked ? 'On' : 'Off'}</span>
      </button>
    </div>
  );
}

export default function PrivacyPage({
  settings,
  onSettingsChange,
  historyCount,
  localCount = historyCount,
  storageMode = 'local',
  onClearEverything,
}) {
  const isAccount = storageMode === 'account';
  const [confirm, setConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Privacy & Method"
        title="What JaalBreak stores, and how it decides"
        lede="Every analysis runs in your browser. This page explains exactly what is kept, where, how to delete it, and the rules behind every verdict."
      />

      <section className="act-grid">
        <div className="panel">
          <p className="eyebrow">Your data</p>
          <h2 className="panel__title">
            <Lock size={18} aria-hidden="true" /> Storage settings
          </h2>
          <Toggle
            id="save-history"
            checked={settings.saveHistory}
            onChange={(v) => onSettingsChange({ ...settings, saveHistory: v })}
            label="Save analysis history"
            description={
              isAccount
                ? 'Keeps a summary of each analysis (date, category, assessment, tactic names) in your JaalBreak account. Only you can read it.'
                : 'Keeps a summary of each analysis (date, category, assessment, tactic names) in this browser’s localStorage.'
            }
          />
          <Toggle
            id="save-text"
            checked={settings.saveFullText}
            onChange={(v) => onSettingsChange({ ...settings, saveFullText: v })}
            label="Also save the full message text"
            description={
              isAccount
                ? 'Applies to guest history in this browser only. Your account never stores message text, so this has no effect while you are signed in.'
                : 'Off by default. When on, the message and its evidence phrases are stored so you can re-open them in X-Ray. Anyone using this browser profile could read them.'
            }
          />

          <dl className="facts facts--wide">
            <div>
              <dt>Where</dt>
              <dd>{isAccount ? 'Your JaalBreak account (summaries only)' : 'This browser only (localStorage)'}</dd>
            </div>
            <div>
              <dt>{isAccount ? 'Who can read it' : 'Encrypted / synced'}</dt>
              <dd>{isAccount ? 'Only you, when signed in' : 'No / No'}</dd>
            </div>
            <div>
              <dt>Records stored</dt>
              <dd>
                {historyCount}
                {isAccount && localCount > 0 ? ` (+ ${localCount} guest in this browser)` : ''}
              </dd>
            </div>
            <div>
              <dt>Screenshots</dt>
              <dd>Never stored; read in memory only</dd>
            </div>
          </dl>

          <div className="danger-zone">
            {confirm ? (
              <span className="confirm">
                {isAccount
                  ? 'Delete guest history and settings stored in this browser?'
                  : 'Delete all history and reset settings?'}
                <button
                  type="button"
                  className="btn btn--danger btn--sm"
                  onClick={() => {
                    onClearEverything();
                    setConfirm(false);
                    setCleared(true);
                  }}
                >
                  Yes, delete everything
                </button>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setConfirm(false)}>
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setConfirm(true);
                  setCleared(false);
                }}
              >
                <Trash2 size={16} aria-hidden="true" /> {isAccount ? 'Delete JaalBreak data in this browser' : 'Delete all JaalBreak data'}
              </button>
            )}
            {cleared && <p className="success-text">All JaalBreak data in this browser has been deleted.</p>}
            {isAccount && (
              <p className="fine-print">
                To delete the history saved in your account, use <a href="#/history" className="inline-link">Analysis History → Delete all</a>.
              </p>
            )}
          </div>
        </div>

        <div className="panel">
          <p className="eyebrow">Scope</p>
          <h2 className="panel__title">What this prototype does and does not do</h2>
          <ul className="scope-list">
            {DOES.map((d) => (
              <li key={d} className="scope-list__yes">
                <CircleCheck size={16} aria-hidden="true" /> {d}
              </li>
            ))}
            {DOES_NOT.map((d) => (
              <li key={d} className="scope-list__no">
                <CircleX size={16} aria-hidden="true" /> Does not {d.charAt(0).toLowerCase() + d.slice(1)}
              </li>
            ))}
          </ul>
          <blockquote className="trust">{TRUST_STATEMENT}</blockquote>
        </div>
      </section>

      <section className="panel">
        <p className="eyebrow">Method</p>
        <h2 className="panel__title panel__title--serif">How a verdict is reached</h2>
        <ol className="pipeline">
          <li>
            <strong>Normalise.</strong> Your text is Unicode-normalised (NFC) and line endings are unified; this is the
            text shown back to you. To catch tricks like hidden characters, full-width letters or wrapped lines, the rules
            run on a cleaned copy, and every quote is mapped back to your exact original words. Up to{' '}
            {MAX_INPUT_LENGTH.toLocaleString('en-IN')} characters are analysed.
          </li>
          <li>
            <strong>Match rules.</strong> {RULES.length} English, Hindi and Hinglish rules, plus offline link checks,
            look for known patterns. Matching is case-insensitive.
          </li>
          <li>
            <strong>Verify spans.</strong> Every quote must equal the exact text at its position in your message, or it
            is discarded.
          </li>
          <li>
            <strong>Band.</strong> Each matched check adds its weight once (weak 1, moderate 2, strong 3). Total ≥{' '}
            {THRESHOLDS.high}, or {THRESHOLDS.strongChecksForHigh}+ strong checks → “Strong match for a known scam
            pattern”. Total ≥ {THRESHOLDS.medium} → “Several warning signs”. Otherwise → “Few warning signs found”.
          </li>
          <li>
            <strong>Advise.</strong> Next steps come from fixed, reviewed templates for the detected category.
          </li>
        </ol>
        <p className="fine-print">
          Rules version {RULES_VERSION}. The bands are not probabilities and have not been statistically validated.
          AI explanation: not connected — this build is rules-only, so results are always available offline.
        </p>
      </section>

      <section className="panel">
        <div className="panel__head">
          <div>
            <p className="eyebrow">Rule catalogue</p>
            <h2 className="panel__title">Every check JaalBreak runs</h2>
          </div>
          <span className="panel__meta">{RULES.length + 2} checks</span>
        </div>
        <div className="table-wrap">
          <table className="table table--compact">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">What it looks for</th>
                <th scope="col">Tactic</th>
                <th scope="col" className="hide-sm">
                  Language
                </th>
                <th scope="col" className="num">
                  Weight
                </th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r) => (
                <tr key={r.id}>
                  <td>
                    <code>{r.id}</code>
                  </td>
                  <td>{r.description}</td>
                  <td>{getTactic(r.tactic).short}</td>
                  <td className="hide-sm">{LANG_LABEL[r.lang]}</td>
                  <td className="num">{r.severity}</td>
                </tr>
              ))}
              <tr>
                <td>
                  <code>LNK-01</code>
                </td>
                <td>Contains a link (not opened or verified)</td>
                <td>Link</td>
                <td className="hide-sm">Any</td>
                <td className="num">1</td>
              </tr>
              <tr>
                <td>
                  <code>LNK-02</code>
                </td>
                <td>Link with a shortener, risky domain ending, IP address or look-alike wording</td>
                <td>Suspicious link</td>
                <td className="hide-sm">Any</td>
                <td className="num">3</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="fine-print">
          Categories: {Object.values(CATEGORY_LABELS).join(' · ')}. Languages other than English, Hindi, Hinglish and Kannada (beta) are labelled
          as unreviewed in results.
        </p>
      </section>
    </div>
  );
}
