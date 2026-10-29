// Auth helper tests — run with:  npm test
// No network or Supabase project needed: these are pure functions.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validatePassword,
  validateSignup,
  validateLogin,
  validateNewPassword,
  friendlyAuthError,
  parseAuthRedirect,
  resolveAccessStatus,
  displayName,
  firstName,
  NETWORK_MESSAGE,
} from './authValidation.js';

test('email validation: empty, malformed and valid', () => {
  assert.match(validateEmail(''), /Enter your email/);
  assert.match(validateEmail('abdullah'), /valid email/);
  assert.match(validateEmail('a@b'), /valid email/);
  assert.match(validateEmail('a @b.com'), /valid email/);
  assert.equal(validateEmail('  name@example.com  '), '');
});

test('password requirements: length, letter and number', () => {
  assert.match(validatePassword(''), /Enter a password/);
  assert.match(validatePassword('abc1'), /at least 8 characters/);
  assert.match(validatePassword('abcdefgh'), /a number/);
  assert.match(validatePassword('12345678'), /a letter/);
  assert.equal(validatePassword('safer2026'), '');
});

test('signup: all fields required, passwords must match', () => {
  const empty = validateSignup({ fullName: '', email: '', password: '', confirm: '' });
  assert.deepEqual(Object.keys(empty).sort(), ['confirm', 'email', 'fullName', 'password']);

  const mismatch = validateSignup({ fullName: 'Asha Rao', email: 'asha@example.com', password: 'safer2026', confirm: 'safer2027' });
  assert.deepEqual(mismatch, { confirm: 'Passwords do not match.' });

  const ok = validateSignup({ fullName: 'Asha Rao', email: 'asha@example.com', password: 'safer2026', confirm: 'safer2026' });
  assert.deepEqual(ok, {});
});

test('login and new-password validation', () => {
  assert.deepEqual(Object.keys(validateLogin({ email: 'x', password: '' })).sort(), ['email', 'password']);
  assert.deepEqual(validateLogin({ email: 'asha@example.com', password: 'anything' }), {});
  assert.deepEqual(Object.keys(validateNewPassword({ password: 'short', confirm: 'other' })).sort(), ['confirm', 'password']);
});

test('friendly errors: known codes, network failures, no raw server text', () => {
  assert.match(friendlyAuthError({ code: 'invalid_credentials', message: 'Invalid login credentials' }), /don’t match/);
  assert.match(friendlyAuthError({ code: 'email_not_confirmed' }), /verify your email/);
  assert.match(friendlyAuthError({ code: 'user_already_exists' }), /already exists/);
  assert.match(friendlyAuthError({ code: 'weak_password' }), /too weak/);
  assert.match(friendlyAuthError({ code: 'session_expired' }), /expired/);
  assert.equal(friendlyAuthError({ name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' }), NETWORK_MESSAGE);
  assert.match(friendlyAuthError({ status: 503, message: 'upstream connect error' }), /problem on its side/);
  // Old servers without codes
  assert.match(friendlyAuthError({ message: 'Invalid login credentials' }), /don’t match/);
  // Unknown errors never leak the raw message
  const raw = 'duplicate key value violates unique constraint "users_pkey" (SQLSTATE 23505)';
  const shown = friendlyAuthError({ status: 400, message: raw });
  assert.ok(!shown.includes('SQLSTATE') && !shown.includes('users_pkey'));
  assert.equal(friendlyAuthError(null), '');
});

test('email-link redirects: code, recovery marker, errors in query or hash', () => {
  assert.deepEqual(parseAuthRedirect('?flow=recovery&code=abc', '#/overview'), {
    hasAuthParams: true,
    isRecovery: true,
    errorCode: '',
  });
  assert.equal(parseAuthRedirect('?code=abc', '').hasAuthParams, true);
  assert.equal(parseAuthRedirect('?error=access_denied&error_code=otp_expired', '').errorCode, 'otp_expired');
  assert.equal(parseAuthRedirect('', '#error=access_denied&error_code=otp_expired&error_description=x').errorCode, 'otp_expired');
  assert.deepEqual(parseAuthRedirect('', '#/simulator/bank-kyc'), { hasAuthParams: false, isRecovery: false, errorCode: '' });
});

test('access status: loading, account, guest, signed out', () => {
  const session = { user: { id: 'u1' } };
  assert.equal(resolveAccessStatus({ ready: false, session, guest: true }), 'loading');
  assert.equal(resolveAccessStatus({ ready: true, session, guest: true }), 'authenticated');
  assert.equal(resolveAccessStatus({ ready: true, session: null, guest: true }), 'guest');
  assert.equal(resolveAccessStatus({ ready: true, session: null, guest: false }), 'signedOut');
  // After logout, the session is gone and the guest flag is cleared -> sign-in screen
  assert.equal(resolveAccessStatus({ ready: true, session: null, guest: false }), 'signedOut');
});

test('greeting name: profile, then metadata, then email', () => {
  const user = { email: 'asha.rao@example.com', user_metadata: { full_name: 'Asha Meta' } };
  assert.equal(displayName(user, { full_name: 'Asha Rao' }), 'Asha Rao');
  assert.equal(displayName(user, null), 'Asha Meta');
  assert.equal(displayName({ email: 'asha.rao@example.com', user_metadata: {} }, null), 'asha.rao');
  assert.equal(firstName('Asha Rao'), 'Asha');
  assert.equal(firstName(''), 'there');
});

test('server-side signup failure is not blamed on the internet connection', () => {
  const msg = friendlyAuthError({ name: 'AuthRetryableFetchError', status: 500, message: 'Database error saving new user' });
  assert.match(msg, /problem on its side/);
  assert.match(friendlyAuthError({ name: 'AuthApiError', status: 500, code: 'unexpected_failure', message: 'Database error saving new user' }), /problem on its side/);
  assert.equal(friendlyAuthError({ name: 'AuthRetryableFetchError', status: 0, message: 'Failed to fetch' }), NETWORK_MESSAGE);
});
