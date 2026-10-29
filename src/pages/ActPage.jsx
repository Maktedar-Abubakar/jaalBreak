import { useMemo, useState } from 'react';
import { Download, Phone, CirclePause, TriangleAlert, CircleCheck, Info } from '../components/Icons.js';
import PageHeader from '../components/PageHeader.jsx';
import OfficialResources from '../components/OfficialResources.jsx';
import CopyButton from '../components/CopyButton.jsx';
import { buildIncidentReport, EMPTY_REPORT_FIELDS } from '../utils/reportBuilder.js';
import { downloadText } from '../utils/format.js';
import { CATEGORY_ADVICE, UNIVERSAL_STEPS } from '../data/advice.js';

export default function ActPage({ analysis, onPause }) {
  const [fields, setFields] = useState(EMPTY_REPORT_FIELDS);
  const [includeAnalysis, setIncludeAnalysis] = useState(true);
  const [edited, setEdited] = useState(null); // user's manual edits to the draft text

  const generated = useMemo(
    () => buildIncidentReport(fields, includeAnalysis ? analysis : null),
    [fields, analysis, includeAnalysis]
  );
  const reportText = edited ?? generated;

  const update = (key) => (e) => {
    setFields((f) => ({ ...f, [key]: e.target.value }));
    setEdited(null); // regenerate from the form after a field change
  };

  const advice = analysis ? analysis.advice : CATEGORY_ADVICE.general;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Report & Next Steps"
        title="Act calmly, through official channels"
        lede="Decide what to do based on whether money has been lost, then prepare a clear note you can use when reporting. JaalBreak never files anything for you."
      >
        <button type="button" className="btn btn--secondary" onClick={onPause}>
          <CirclePause size={16} aria-hidden="true" /> I feel pressured
        </button>
      </PageHeader>

      <section className="decision-split">
        <div className="panel decision-card">
          <p className="eyebrow">If no money has been lost</p>
          <h2 className="panel__title panel__title--serif">Pause, verify, report the message</h2>
          <ol className="steps">
            <li>Do not reply, click links or call numbers from the message.</li>
            <li>Verify through the official app, or a number or website you find yourself.</li>
            <li>
              Report the message on{' '}
              <a href="https://sancharsaathi.gov.in/sfc/" target="_blank" rel="noopener noreferrer" className="inline-link">
                Chakshu (sancharsaathi.gov.in/sfc)
              </a>
              .
            </li>
            <li>Block the sender.</li>
          </ol>
        </div>
        <div className="panel decision-card decision-card--urgent">
          <p className="eyebrow eyebrow--red">If money has already been lost</p>
          <h2 className="panel__title panel__title--serif">Act within minutes, not hours</h2>
          <ol className="steps">
            <li>
              Call{' '}
              <a href="tel:1930" className="inline-link">
                <Phone size={14} aria-hidden="true" /> 1930
              </a>{' '}
              (National Cyber Crime Helpline) promptly.
            </li>
            <li>Call your bank using the number printed on your card, and block the card or UPI if needed.</li>
            <li>
              File a complaint at{' '}
              <a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="inline-link">
                cybercrime.gov.in
              </a>
              .
            </li>
            <li>Keep screenshots, transaction IDs and the sender’s details.</li>
          </ol>
          <p className="fine-print">Recovery is not guaranteed. Reporting quickly gives the best chance.</p>
        </div>
      </section>

      <section className="act-grid">
        <div className="panel">
          <p className="eyebrow">{analysis ? `For your latest analysis · ${analysis.category.label}` : 'General guidance'}</p>
          <h2 className="panel__title panel__title--serif">{advice.headline}</h2>
          <ol className="steps">
            {advice.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <ul className="checklist">
            {UNIVERSAL_STEPS.map((s) => (
              <li key={s}>
                <CircleCheck size={15} aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <p className="eyebrow">Official resources</p>
          <OfficialResources />
        </div>
      </section>

      <section className="panel report-builder" aria-labelledby="report-title">
        <div className="panel__head">
          <div>
            <p className="eyebrow">Incident report draft</p>
            <h2 id="report-title" className="panel__title">
              Prepare a note for your report
            </h2>
          </div>
        </div>
        <div className="callout callout--warning">
          <TriangleAlert size={18} aria-hidden="true" />
          <p>
            Never type an OTP, PIN, password or CVV here or into any report. All fields are optional; anything you leave
            blank appears as <code>[not provided]</code>. Nothing is saved or sent.
          </p>
        </div>

        <div className="report-builder__grid">
          <form className="form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
              <label className="field">
                <span className="field__label">Date and time received</span>
                <input className="input" type="text" placeholder="e.g. 19 Oct 2026, 9:40 PM" value={fields.dateReceived} onChange={update('dateReceived')} />
              </label>
              <label className="field">
                <span className="field__label">Channel</span>
                <select className="select" value={fields.channel} onChange={update('channel')}>
                  <option value="">Select…</option>
                  <option>SMS</option>
                  <option>WhatsApp</option>
                  <option>Telegram</option>
                  <option>Phone call</option>
                  <option>Email</option>
                  <option>Social media</option>
                  <option>Other</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span className="field__label">Sender number, ID or email (as shown)</span>
              <input className="input" type="text" value={fields.senderId} onChange={update('senderId')} />
            </label>
            <label className="field">
              <span className="field__label">What happened, in your own words</span>
              <textarea className="textarea" rows={4} value={fields.description} onChange={update('description')} />
            </label>
            <fieldset className="field">
              <legend className="field__label">Has money been lost?</legend>
              <div className="radio-row">
                {[
                  ['no', 'No'],
                  ['yes', 'Yes'],
                  ['not-sure', 'Not sure'],
                ].map(([v, label]) => (
                  <label key={v} className="radio">
                    <input type="radio" name="moneyLost" value={v} checked={fields.moneyLost === v} onChange={update('moneyLost')} />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {fields.moneyLost === 'yes' && (
              <div className="form-row form-row--3">
                <label className="field">
                  <span className="field__label">Amount</span>
                  <input className="input" type="text" value={fields.amount} onChange={update('amount')} />
                </label>
                <label className="field">
                  <span className="field__label">Payment method</span>
                  <input className="input" type="text" placeholder="UPI, card, bank transfer…" value={fields.paymentMethod} onChange={update('paymentMethod')} />
                </label>
                <label className="field">
                  <span className="field__label">Transaction ref / UTR</span>
                  <input className="input" type="text" value={fields.transactionRef} onChange={update('transactionRef')} />
                </label>
              </div>
            )}
            <label className="checkbox">
              <input
                type="checkbox"
                checked={includeAnalysis}
                onChange={(e) => {
                  setIncludeAnalysis(e.target.checked);
                  setEdited(null);
                }}
                disabled={!analysis}
              />
              Include the analysed message text and quoted warning signs
              {!analysis && <span className="fine-print"> (analyse a message first)</span>}
            </label>
          </form>

          <div className="report-preview">
            <label htmlFor="report-text" className="mini-label">
              Draft (you can edit it directly)
            </label>
            <textarea
              id="report-text"
              className="textarea textarea--mono"
              rows={18}
              value={reportText}
              onChange={(e) => setEdited(e.target.value)}
            />
            <div className="button-row">
              <CopyButton getText={() => reportText} label="Copy draft" className="btn btn--primary" />
              <button type="button" className="btn btn--secondary" onClick={() => downloadText('jaalbreak-incident-note.txt', reportText)}>
                <Download size={16} aria-hidden="true" /> Download .txt
              </button>
              {edited !== null && (
                <button type="button" className="btn btn--link" onClick={() => setEdited(null)}>
                  Discard manual edits
                </button>
              )}
            </div>
            <p className="fine-print">
              <Info size={13} aria-hidden="true" /> Paste this into the official complaint form. JaalBreak does not
              submit it anywhere.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
