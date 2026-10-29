// Small, accessible form pieces used by the sign-in screens.

import { useState } from 'react';
import { Eye, EyeOff, TriangleAlert, LoaderCircle, Check, Info } from '../components/Icons.js';
import { passwordProblems, PASSWORD_MIN } from '../utils/authValidation.js';

export function TextField({ id, label, error, hint, className = '', ...inputProps }) {
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`field auth-field ${className}`}>
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="fine-print">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          <TriangleAlert size={14} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

export function PasswordField({ id, label, error, value, showRules = false, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  const rulesId = showRules ? `${id}-rules` : null;
  const describedBy = [error ? `${id}-error` : null, rulesId].filter(Boolean).join(' ') || undefined;
  const unmet = passwordProblems(value);
  const rules = [
    { text: `${PASSWORD_MIN}+ characters`, ok: !unmet.includes(`at least ${PASSWORD_MIN} characters`) },
    { text: 'A letter', ok: !unmet.includes('a letter') },
    { text: 'A number', ok: !unmet.includes('a number') },
  ];

  return (
    <div className="field auth-field">
      <label htmlFor={id} className="field__label">
        {label}
      </label>
      <div className="password-input">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          className="input"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        <button
          type="button"
          className="password-input__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
      {showRules && (
        <ul id={rulesId} className="password-rules" aria-label="Password requirements">
          {rules.map((r) => (
            <li key={r.text} className={r.ok ? 'is-met' : ''}>
              <Check size={13} aria-hidden="true" /> {r.text}
              <span className="visually-hidden">{r.ok ? ' (met)' : ' (not met yet)'}</span>
            </li>
          ))}
        </ul>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          <TriangleAlert size={14} aria-hidden="true" /> {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ busy, busyLabel, children, disabled }) {
  return (
    <button type="submit" className="btn btn--primary btn--block auth-submit" disabled={busy || disabled} aria-busy={busy}>
      {busy ? (
        <>
          <LoaderCircle size={16} className="spin" aria-hidden="true" /> {busyLabel}
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function FormAlert({ tone = 'danger', children, action }) {
  if (!children) return null;
  const Icon = tone === 'info' || tone === 'neutral' ? Info : TriangleAlert;
  return (
    <div className={`callout callout--${tone} auth-alert`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={16} aria-hidden="true" />
      <div>
        <p>{children}</p>
        {action}
      </div>
    </div>
  );
}
