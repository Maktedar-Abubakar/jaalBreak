// One-tap report pack: a ready-to-file complaint built from the result, plus
// the right official places to report. JaalBreak never submits anything itself.
import { useEffect, useMemo, useRef, useState } from 'react';
import { X, PhoneCall, ExternalLink, Download, FileText } from './Icons.js';
import CopyButton from './CopyButton.jsx';
import { buildIncidentReport, EMPTY_REPORT_FIELDS } from '../utils/reportBuilder.js';
import { navigate } from '../utils/useHashRoute.js';

function today() {
  const d = new Date();
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ReportPack({ open, onClose, result }) {
  const [fields, setFields] = useState({ ...EMPTY_REPORT_FIELDS });
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    setFields({ ...EMPTY_REPORT_FIELDS, dateReceived: today(), description: `I received this message. JaalBreak flagged it as: ${result?.band.label} (${result?.category.label}). I have not shared any OTP, PIN or password.` });
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, result]);

  const text = useMemo(() => (result ? buildIncidentReport(fields, result) : ''), [fields, result]);
  if (!open || !result) return null;
  const isAccount = result.category.key === 'account_takeover';
  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal modal--wide" role="dialog" aria-modal="true" aria-labelledby="pack-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <p className="eyebrow">Report pack</p>
          <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <h2 id="pack-title" className="modal__title">
          Report it in two minutes
        </h2>

        <ol className="report-route">
          <li>
            <strong>Lost money?</strong> Call <a href="tel:1930" className="btn btn--danger btn--sm"><PhoneCall size={14} aria-hidden="true" /> 1930</a> right now — the first hour matters most for freezing the money.
          </li>
          <li>
            <strong>Report the number or message</strong> on{' '}
            <a className="inline-link" href="https://sancharsaathi.gov.in/sfc/" target="_blank" rel="noopener noreferrer">
              Chakshu (Sanchar Saathi) <ExternalLink size={13} aria-hidden="true" />
            </a>
            .
          </li>
          <li>
            <strong>File a complaint</strong> at{' '}
            <a className="inline-link" href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer">
              cybercrime.gov.in <ExternalLink size={13} aria-hidden="true" />
            </a>{' '}
            — paste the text below.
          </li>
          {isAccount && (
            <li>
              <strong>Account taken over?</strong> Start recovery at{' '}
              <a className="inline-link" href="https://www.instagram.com/hacked/" target="_blank" rel="noopener noreferrer">
                instagram.com/hacked <ExternalLink size={13} aria-hidden="true" />
              </a>{' '}
              (Facebook: facebook.com/hacked). Never pay anyone who offers to "recover" it.
            </li>
          )}
        </ol>

        <div className="pack-fields">
          <label>
            <span>When did it arrive?</span>
            <input value={fields.dateReceived} onChange={set('dateReceived')} />
          </label>
          <label>
            <span>Where? (SMS, WhatsApp, Instagram…)</span>
            <input value={fields.channel} onChange={set('channel')} placeholder="e.g. WhatsApp" />
          </label>
          <label>
            <span>Sender number / ID</span>
            <input value={fields.senderId} onChange={set('senderId')} placeholder="e.g. +91 98xxxxxx10" />
          </label>
        </div>
        <textarea className="pack-text" readOnly value={text} rows={9} aria-label="Complaint text" />
        <div className="button-row">
          <CopyButton getText={() => text} label="Copy complaint text" />
          <button type="button" className="btn btn--secondary" onClick={() => download('jaalbreak-report.txt', text)}>
            <Download size={16} aria-hidden="true" /> Download
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => { onClose(); navigate('act'); }}>
            <FileText size={16} aria-hidden="true" /> Full report form
          </button>
        </div>
        <p className="fine-print">JaalBreak never submits anything for you. Nothing here leaves your device unless you paste it somewhere.</p>
      </div>
    </div>
  );
}
