// ---------------------------------------------------------------------------
// Pure helpers for the sign-in / sign-up forms. No Supabase import here, so
// these can be tested with `npm test` without a network or a real project.
// ---------------------------------------------------------------------------

export const PASSWORD_MIN = 8;
export const NAME_MAX = 100;

// Deliberately simple: one "@", something before it, a dot in the domain.
// The real check is Supabase sending a verification email.
// Structural check only (the verification email is the real proof). Rejects
// consecutive dots, a leading/trailing dot in the name part, a trailing dot or empty
// label in the domain, hyphens at label edges, and one-letter endings like ".c".
function isValidEmail(value) {
  if (value.length > 254 || /\s/.test(value)) return false;
  const at = value.indexOf('@');
  if (at < 1 || at !== value.lastIndexOf('@')) return false;
  const local = value.slice(0, at);
  const labels = value.slice(at + 1).split('.');
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (labels.length < 2) return false;
  const badLabel = (l) => !l || l.length > 63 || l.startsWith('-') || l.endsWith('-') || !/^[\p{L}\p{N}-]+$/u.test(l);
  if (labels.some(badLabel)) return false;
  return /^(?:\p{L}{2,}|xn--[a-z0-9-]+)$/u.test(labels[labels.length - 1]);
}

export function validateEmail(email) {
  const value = String(email || '').trim();
  if (!value) return 'Enter your email address.';
  if (!isValidEmail(value)) return 'Enter a valid email address, like name@example.com.';
  return '';
}

/** Returns a list of unmet requirements (empty list = OK). */
export function passwordProblems(password) {
  const p = String(password || '');
  const problems = [];
  if (p.length < PASSWORD_MIN) problems.push(`at least ${PASSWORD_MIN} characters`);
  if (!/\p{L}/u.test(p)) problems.push('a letter');
  if (!/[0-9]/.test(p)) problems.push('a number');
  return problems;
}

export function validatePassword(password) {
  if (!password) return 'Enter a password.';
  const problems = passwordProblems(password);
  return problems.length ? `Password needs ${problems.join(', ')}.` : '';
}

export function validateConfirm(password, confirm) {
  if (!confirm) return 'Re-enter your password.';
  return password === confirm ? '' : 'Passwords do not match.';
}

export function validateName(name) {
  const value = String(name || '').trim();
  if (!value) return 'Enter your full name.';
  if (value.length > NAME_MAX) return `Name must be ${NAME_MAX} characters or fewer.`;
  return '';
}

/** Returns an object of field -> message, only for fields with problems. */
export function validateSignup({ fullName, email, password, confirm }) {
  const errors = {
    fullName: validateName(fullName),
    email: validateEmail(email),
    password: validatePassword(password),
    confirm: validateConfirm(password, confirm),
  };
  return dropEmpty(errors);
}

export function validateLogin({ email, password }) {
  return dropEmpty({
    email: validateEmail(email),
    password: password ? '' : 'Enter your password.',
  });
}

export function validateNewPassword({ password, confirm }) {
  return dropEmpty({ password: validatePassword(password), confirm: validateConfirm(password, confirm) });
}

function dropEmpty(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v));
}

// ---------------------------------------------------------------------------
// Turn a Supabase error into a sentence a person can act on.
// Raw database / server messages are never shown.
// ---------------------------------------------------------------------------
const MESSAGES = {
  invalid_credentials: 'That email and password don’t match an account. Check both and try again.',
  email_not_confirmed: 'Please verify your email first. Open the link we sent you, then sign in.',
  user_already_exists: 'An account with this email already exists. Sign in instead, or reset your password.',
  email_exists: 'An account with this email already exists. Sign in instead, or reset your password.',
  weak_password: `That password is too weak. Use at least ${PASSWORD_MIN} characters with letters and numbers.`,
  same_password: 'Your new password must be different from your current one.',
  over_email_send_rate_limit: 'Too many emails were sent recently. Wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts. Wait a few minutes and try again.',
  email_address_invalid: 'Enter a valid email address, like name@example.com.',
  signup_disabled: 'New sign-ups are currently turned off. You can continue as a guest.',
  email_provider_disabled: 'Email sign-in is currently turned off. You can continue as a guest.',
  session_expired: 'Your session has expired. Please sign in again.',
  session_not_found: 'Your session has expired. Please sign in again.',
  refresh_token_not_found: 'Your session has expired. Please sign in again.',
  otp_expired: 'That email link has expired or was already used. Request a new one.',
  flow_state_expired: 'That email link has expired. Request a new one.',
  flow_state_not_found:
    'That link must be opened in the same browser you used to request it. If you were verifying your email, it may already be verified — try signing in.',
  recovery_link_failed:
    'That reset link didn’t work. It may have expired, or been opened in a different browser. Request a new one from this browser.',
  bad_code_verifier:
    'That link must be opened in the same browser you used to request it. If you were verifying your email, it may already be verified — try signing in.',
};

export const NETWORK_MESSAGE =
  'We couldn’t reach the account service. Check your internet connection and try again — or continue as a guest.';

export function friendlyAuthError(error) {
  if (!error) return '';
  const code = error.code || error.error_code || '';
  if (MESSAGES[code]) return MESSAGES[code];

  const name = error.name || '';
  const status = Number(error.status);
  const raw = String(error.message || '').toLowerCase();

  // A real server error (e.g. "Database error saving new user") is not a network problem.
  // This must come BEFORE the network check below.
  if (status >= 500 || code === 'unexpected_failure' || raw.includes('database error')) {
    return 'The account service hit a problem on its side. Please try again shortly, or continue as a guest.';
  }

  if (name === 'AuthRetryableFetchError' || status === 0 || raw.includes('failed to fetch') || raw.includes('network')) {
    return NETWORK_MESSAGE;
  }
  if (status === 429) return MESSAGES.over_request_rate_limit;

  // Older Supabase servers send messages without codes.
  if (raw.includes('invalid login credentials')) return MESSAGES.invalid_credentials;
  if (raw.includes('email not confirmed')) return MESSAGES.email_not_confirmed;
  if (raw.includes('already registered')) return MESSAGES.user_already_exists;
  if (raw.includes('password should')) return MESSAGES.weak_password;

  return 'Something went wrong. Please try again.';
}

/**
 * Supabase email links return here with `?code=...` (success) or with
 * `error`, `error_code`, `error_description` in the query or the hash.
 * Returns { hasAuthParams, isRecovery, errorCode }.
 */
export function parseAuthRedirect(search, hash) {
  const q = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  // Error params can arrive in the hash as "#error=...&error_code=..."
  const h = new URLSearchParams(String(hash || '').replace(/^#\/?/, ''));
  const errorCode = q.get('error_code') || h.get('error_code') || q.get('error') || h.get('error') || '';
  return {
    hasAuthParams: Boolean(q.get('code') || errorCode || q.get('flow')),
    isRecovery: q.get('flow') === 'recovery',
    errorCode,
  };
}

/**
 * Decide what the app should show.
 *   'loading'       – still restoring a saved session
 *   'authenticated' – signed in with Supabase
 *   'guest'         – chose "Continue as Guest" on this browser
 *   'signedOut'     – show the sign-in screen
 */
export function resolveAccessStatus({ ready, session, guest }) {
  if (!ready) return 'loading';
  if (session && session.user) return 'authenticated';
  if (guest) return 'guest';
  return 'signedOut';
}

/** Name to greet someone with. Falls back to the part of the email before "@". */
export function displayName(user, profile) {
  const fromProfile = profile && typeof profile.full_name === 'string' ? profile.full_name.trim() : '';
  const fromMeta = user && user.user_metadata && typeof user.user_metadata.full_name === 'string'
    ? user.user_metadata.full_name.trim()
    : '';
  const name = fromProfile || fromMeta;
  if (name) return name;
  const email = (user && user.email) || '';
  return email ? email.split('@')[0] : 'there';
}

export function firstName(name) {
  return String(name || '').trim().split(/\s+/)[0] || 'there';
}
