// ---------------------------------------------------------------------------
// Full-screen sign-in experience: Sign in, Create account, Forgot password,
// Set a new password (after a reset email), and "Check your email".
// Everyone can skip it with "Continue as Guest".
// ---------------------------------------------------------------------------

import { useEffect, useRef, useState } from 'react';
import Logo from '../components/Logo.jsx';
import { ArrowLeft, ArrowRight, Layers, GitBranch, ShieldCheck, Mail, UserRound } from '../components/Icons.js';
import { useAuth } from './AuthProvider.jsx';
import { TextField, PasswordField, SubmitButton, FormAlert } from './AuthFields.jsx';
import { validateLogin, validateSignup, validateEmail, validateNewPassword } from '../utils/authValidation.js';

const POINTS = [
  { icon: Layers, text: 'See the exact words in a message that are designed to pressure you.' },
  { icon: GitBranch, text: 'Practise common scam journeys before real money is at risk.' },
  { icon: ShieldCheck, text: 'JaalBreak never asks for your OTP, PIN or banking password.' },
];

const TITLES = {
  login: { eyebrow: 'Welcome back', title: 'Sign in to JaalBreak' },
  signup: { eyebrow: 'New here', title: 'Create your account' },
  forgot: { eyebrow: 'Account recovery', title: 'Reset your password' },
  reset: { eyebrow: 'Account recovery', title: 'Choose a new password' },
  checkEmail: { eyebrow: 'One more step', title: 'Check your email' },
};

export default function AuthScreen({ initialView = 'login', onDone }) {
  const auth = useAuth();
  const [view, setView] = useState(auth.recovery ? 'reset' : initialView);
  const [pendingEmail, setPendingEmail] = useState('');
  const headingRef = useRef(null);

  useEffect(() => {
    if (auth.recovery) setView('reset');
  }, [auth.recovery]);

  useEffect(() => {
    if (!auth.recovery) setView(initialView);
  }, [initialView, auth.recovery]);

  // Move focus to the heading when the view changes (screen-reader friendly).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [view]);

  const go = (next) => {
    auth.clearNotice();
    setView(next);
  };

  const { eyebrow, title } = TITLES[view];
  const showGuest = view !== 'reset';

  return (
    <div className="auth">
      <aside className="auth__brand">
        <div className="auth__logo">
          <Logo />
        </div>
        <div className="auth__pitch">
          <p className="eyebrow eyebrow--inverse">Evidence-first scam triage</p>
          <p className="auth__headline">
            JaalBreak <span aria-hidden="true">—</span>
            <br />
            Think Before You Trust.
          </p>
          <p className="auth__lede">
            Analyze suspicious messages, recognize manipulation tactics, and make safer decisions online.
          </p>
          <ul className="auth__points">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="auth__fine">Prototype using deterministic rules. It highlights patterns; it does not prove fraud or safety.</p>
      </aside>

      <main className="auth__main" id="main">
        <div className="auth__card">
          <header className="auth__head">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="auth__title" tabIndex={-1} ref={headingRef}>
              {title}
            </h1>
          </header>

          {!auth.configured && view !== 'checkEmail' && (
            <FormAlert tone="warning">
              Accounts aren’t set up in this version of JaalBreak yet. Every feature still works in guest mode.
            </FormAlert>
          )}
          {auth.notice && <FormAlert tone="warning">{auth.notice}</FormAlert>}

          {view === 'login' && <LoginForm onForgot={() => go('forgot')} onSignup={() => go('signup')} />}
          {view === 'signup' && (
            <SignupForm
              onLogin={() => go('login')}
              onCheckEmail={(email) => {
                setPendingEmail(email);
                go('checkEmail');
              }}
            />
          )}
          {view === 'forgot' && <ForgotForm onBack={() => go('login')} />}
          {view === 'reset' && <ResetForm onDone={onDone} />}
          {view === 'checkEmail' && <CheckEmail email={pendingEmail} onBack={() => go('login')} />}

          {showGuest && <GuestBlock onDone={onDone} />}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------

function useForm(initial) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const bind = (name) => ({
    value: values[name],
    onChange: (e) => {
      setValues((v) => ({ ...v, [name]: e.target.value }));
      if (errors[name]) setErrors((er) => ({ ...er, [name]: '' }));
      if (formError) setFormError('');
    },
    error: errors[name],
  });
  return { values, setErrors, formError, setFormError, busy, setBusy, bind };
}

function focusFirstError(form, errors) {
  const first = Object.keys(errors)[0];
  if (first) form.querySelector(`[name="${first}"]`)?.focus();
}

function LoginForm({ onForgot, onSignup }) {
  const auth = useAuth();
  const f = useForm({ email: '', password: '' });
  const [unverified, setUnverified] = useState(false);
  const [resent, setResent] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const errors = validateLogin(f.values);
    f.setErrors(errors);
    if (Object.keys(errors).length) return focusFirstError(e.currentTarget, errors);
    f.setBusy(true);
    setResent('');
    const res = await auth.signIn(f.values);
    f.setBusy(false);
    if (res.error) {
      f.setFormError(res.error);
      setUnverified(res.code === 'email_not_confirmed');
    }
    // On success the app switches screens automatically.
  };

  const resend = async () => {
    const res = await auth.resendVerification(f.values.email);
    setResent(res.error || 'Verification email sent. Check your inbox and spam folder.');
  };

  return (
    <form className="auth__form" onSubmit={submit} noValidate>
      <FormAlert
        action={
          unverified && (
            <button type="button" className="btn btn--link auth-inline-btn" onClick={resend}>
              Resend verification email
            </button>
          )
        }
      >
        {f.formError}
      </FormAlert>
      {resent && <FormAlert tone="info">{resent}</FormAlert>}
      <fieldset className="auth__fields" disabled={!auth.configured || f.busy}>
        <TextField id="email" label="Email address" type="email" autoComplete="email" inputMode="email" {...f.bind('email')} />
        <PasswordField id="password" label="Password" autoComplete="current-password" {...f.bind('password')} />
        <div className="auth__row-end">
          <button type="button" className="btn btn--link auth-inline-btn" onClick={onForgot}>
            Forgot password?
          </button>
        </div>
      </fieldset>
      <SubmitButton busy={f.busy} busyLabel="Signing in…" disabled={!auth.configured}>
        Sign in <ArrowRight size={16} aria-hidden="true" />
      </SubmitButton>
      <p className="auth__switch">
        New to JaalBreak?{' '}
        <button type="button" className="btn btn--link auth-inline-btn" onClick={onSignup}>
          Create an account
        </button>
      </p>
    </form>
  );
}

function SignupForm({ onLogin, onCheckEmail }) {
  const auth = useAuth();
  const f = useForm({ fullName: '', email: '', password: '', confirm: '' });

  const submit = async (e) => {
    e.preventDefault();
    const errors = validateSignup(f.values);
    f.setErrors(errors);
    if (Object.keys(errors).length) return focusFirstError(e.currentTarget, errors);
    f.setBusy(true);
    const res = await auth.signUp(f.values);
    f.setBusy(false);
    if (res.error) {
      if (res.code === 'weak_password') f.setErrors({ password: res.error });
      else f.setFormError(res.error);
      return;
    }
    if (res.outcome === 'checkEmail') onCheckEmail(f.values.email.trim());
    // 'signedIn' (email confirmation off): the app switches screens automatically.
  };

  return (
    <form className="auth__form" onSubmit={submit} noValidate>
      <FormAlert>{f.formError}</FormAlert>
      <fieldset className="auth__fields" disabled={!auth.configured || f.busy}>
        <TextField id="fullName" label="Full name" type="text" autoComplete="name" maxLength={100} {...f.bind('fullName')} />
        <TextField id="email" label="Email address" type="email" autoComplete="email" inputMode="email" {...f.bind('email')} />
        <PasswordField id="password" label="Password" autoComplete="new-password" showRules {...f.bind('password')} />
        <PasswordField id="confirm" label="Confirm password" autoComplete="new-password" {...f.bind('confirm')} />
      </fieldset>
      <SubmitButton busy={f.busy} busyLabel="Creating account…" disabled={!auth.configured}>
        Create account <ArrowRight size={16} aria-hidden="true" />
      </SubmitButton>
      <p className="fine-print auth__consent">
        We store your name and email to run your account. Your scan history saves summaries only — never the message
        text.
      </p>
      <p className="auth__switch">
        Already have an account?{' '}
        <button type="button" className="btn btn--link auth-inline-btn" onClick={onLogin}>
          Sign in
        </button>
      </p>
    </form>
  );
}

function ForgotForm({ onBack }) {
  const auth = useAuth();
  const f = useForm({ email: '' });
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const emailError = validateEmail(f.values.email);
    f.setErrors(emailError ? { email: emailError } : {});
    if (emailError) return focusFirstError(e.currentTarget, { email: emailError });
    f.setBusy(true);
    const res = await auth.requestPasswordReset(f.values.email);
    f.setBusy(false);
    if (res.error) f.setFormError(res.error);
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="auth__form">
        <FormAlert tone="info">
          If an account exists for <strong>{f.values.email.trim()}</strong>, a reset link is on its way. Open it in
          this browser. The link expires after a short time.
        </FormAlert>
        <button type="button" className="btn btn--secondary btn--block" onClick={onBack}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form className="auth__form" onSubmit={submit} noValidate>
      <p className="auth__intro">Enter the email you signed up with and we’ll send you a link to set a new password.</p>
      <FormAlert>{f.formError}</FormAlert>
      <fieldset className="auth__fields" disabled={!auth.configured || f.busy}>
        <TextField id="email" label="Email address" type="email" autoComplete="email" inputMode="email" {...f.bind('email')} />
      </fieldset>
      <SubmitButton busy={f.busy} busyLabel="Sending link…" disabled={!auth.configured}>
        Send reset link
      </SubmitButton>
      <button type="button" className="btn btn--ghost btn--block" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
      </button>
    </form>
  );
}

function ResetForm({ onDone }) {
  const auth = useAuth();
  const f = useForm({ password: '', confirm: '' });
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errors = validateNewPassword(f.values);
    f.setErrors(errors);
    if (Object.keys(errors).length) return focusFirstError(e.currentTarget, errors);
    f.setBusy(true);
    const res = await auth.updatePassword(f.values.password);
    f.setBusy(false);
    if (res.error) {
      if (res.code === 'weak_password' || res.code === 'same_password') f.setErrors({ password: res.error });
      else f.setFormError(res.error);
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="auth__form">
        <FormAlert tone="info">Your password has been updated. You’re signed in.</FormAlert>
        <button
          type="button"
          className="btn btn--primary btn--block"
          onClick={() => {
            auth.finishRecovery();
            onDone?.();
          }}
        >
          Continue to JaalBreak <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <form className="auth__form" onSubmit={submit} noValidate>
      <p className="auth__intro">
        Signed in as <strong>{auth.email}</strong>. Choose a new password for your account.
      </p>
      <FormAlert>{f.formError}</FormAlert>
      <fieldset className="auth__fields" disabled={f.busy}>
        <PasswordField id="password" label="New password" autoComplete="new-password" showRules {...f.bind('password')} />
        <PasswordField id="confirm" label="Confirm new password" autoComplete="new-password" {...f.bind('confirm')} />
      </fieldset>
      <SubmitButton busy={f.busy} busyLabel="Saving…">
        Save new password
      </SubmitButton>
      <button
        type="button"
        className="btn btn--ghost btn--block"
        onClick={() => {
          auth.finishRecovery();
          onDone?.();
        }}
      >
        Skip for now
      </button>
    </form>
  );
}

function CheckEmail({ email, onBack }) {
  const auth = useAuth();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const resend = async () => {
    setBusy(true);
    const res = await auth.resendVerification(email);
    setBusy(false);
    setMsg(res.error || 'Sent again. It can take a minute to arrive.');
  };
  return (
    <div className="auth__form">
      <div className="auth__mail">
        <Mail size={22} strokeWidth={1.6} aria-hidden="true" />
        <p>
          We sent a verification link to <strong>{email}</strong>. Open it to activate your account, then sign in. Check
          your spam folder if you don’t see it.
        </p>
      </div>
      {msg && <FormAlert tone="info">{msg}</FormAlert>}
      <button type="button" className="btn btn--secondary btn--block" onClick={resend} disabled={busy}>
        {busy ? 'Sending…' : 'Resend verification email'}
      </button>
      <button type="button" className="btn btn--ghost btn--block" onClick={onBack}>
        <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
      </button>
    </div>
  );
}

function GuestBlock({ onDone }) {
  const auth = useAuth();
  const isGuest = auth.status === 'guest';
  return (
    <div className="auth__guest">
      <div className="auth__divider" role="separator">
        <span>or</span>
      </div>
      <button
        type="button"
        className="btn btn--secondary btn--block auth__guest-btn"
        onClick={() => {
          auth.continueAsGuest();
          onDone?.();
        }}
      >
        <UserRound size={16} aria-hidden="true" /> {isGuest ? 'Back to JaalBreak as guest' : 'Continue as Guest'}
      </button>
      <p className="fine-print auth__guest-note">
        No name, email or password needed. Guest history is kept only in this browser and is lost if you clear your
        browser data.
      </p>
    </div>
  );
}
