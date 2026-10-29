// ---------------------------------------------------------------------------
// "I feel pressured" cooling-off intervention.
// This is the honest substitute for biometric stress detection and automatic
// banking-app lockout (both out of scope). It cannot block other apps; it
// simply gives the user a structured minute to pause and verify.
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';
import { X, Phone } from './Icons.js';

const PAUSE_SECONDS = 60;

const QUESTIONS = [
  'Did they contact me first, unexpectedly?',
  'Am I being asked for money, an OTP, a PIN or to install an app?',
  'Is there a deadline or threat pushing me to act now?',
  'Have I verified this through a number or app I found myself?',
  'Would anything genuinely bad happen if I waited one hour?',
];

export default function PauseModal({ open, onClose }) {
  const [secondsLeft, setSecondsLeft] = useState(PAUSE_SECONDS);
  const [checked, setChecked] = useState({});
  const closeRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    setSecondsLeft(PAUSE_SECONDS);
    setChecked({});
    closeRef.current?.focus();
    const timer = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    const onKey = (e) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  const progress = ((PAUSE_SECONDS - secondsLeft) / PAUSE_SECONDS) * 100;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pause-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal__head">
          <p className="eyebrow">Pause and verify</p>
          <button ref={closeRef} type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <h2 id="pause-title" className="modal__title">
          Nothing needs to happen in the next minute.
        </h2>
        <p className="modal__lede">
          Pressure is a tactic. Put the phone down, breathe slowly, and work through these questions before you reply,
          pay or click anything.
        </p>

        <div className="pause-timer" aria-live="polite">
          <div className="pause-timer__bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="pause-timer__count">
            {secondsLeft > 0 ? `${secondsLeft}s` : 'Done — now verify independently'}
          </span>
        </div>

        <ul className="pause-checklist">
          {QUESTIONS.map((q, i) => (
            <li key={q}>
              <label>
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
                />
                <span>{q}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className="callout callout--neutral">
          <strong>Never share an OTP, PIN, password or CVV.</strong> If money has already been lost, call{' '}
          <a href="tel:1930" className="inline-link">
            <Phone size={14} aria-hidden="true" /> 1930
          </a>{' '}
          now.
        </div>
        <p className="fine-print">
          JaalBreak cannot block or pause other apps. This is a voluntary pause to help you slow down.
        </p>
      </div>
    </div>
  );
}
