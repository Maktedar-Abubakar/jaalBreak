// ---------------------------------------------------------------------------
// Auth state for the whole app.
//
//   const auth = useAuth();
//   auth.status  -> 'loading' | 'authenticated' | 'guest' | 'signedOut'
//   auth.user, auth.name, auth.signIn(), auth.signUp(), auth.signOut(), ...
//
// Guest mode is a LOCAL choice stored in this browser (no Supabase account is
// created). Registered users are handled entirely by Supabase Auth — this app
// never sees, stores or hashes passwords itself.
// ---------------------------------------------------------------------------

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase, isSupabaseConfigured, consumeRecoveryFlag, siteUrl } from '../lib/supabaseClient.js';
import { friendlyAuthError, parseAuthRedirect, resolveAccessStatus, displayName } from '../utils/authValidation.js';

const GUEST_KEY = 'scamshield.guest.v1';

function readGuestFlag() {
  try {
    return window.localStorage.getItem(GUEST_KEY) === '1';
  } catch {
    return false;
  }
}

function writeGuestFlag(on) {
  try {
    if (on) window.localStorage.setItem(GUEST_KEY, '1');
    else window.localStorage.removeItem(GUEST_KEY);
  } catch {
    /* storage blocked: guest mode still works for this visit */
  }
}

/** Remove ?code=… / ?flow=… / #error=… from the address bar after handling them. */
function cleanAuthParamsFromUrl() {
  const hash = window.location.hash.startsWith('#/') ? window.location.hash : '#/overview';
  window.history.replaceState(null, '', `${window.location.pathname}${hash}`);
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(!isSupabaseConfigured);
  const [session, setSession] = useState(null);
  const [guest, setGuest] = useState(() => readGuestFlag());
  const [profile, setProfile] = useState(null);
  const [recovery, setRecovery] = useState(false);
  const [notice, setNotice] = useState('');

  const hadSession = useRef(false);
  const signingOut = useRef(false);

  // 1. Restore the saved session and listen for changes ----------------------
  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    const redirect = parseAuthRedirect(window.location.search, window.location.hash);

    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock.
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') setRecovery(true);
      if (event === 'SIGNED_OUT' && hadSession.current && !signingOut.current) {
        setNotice('Your session has ended. Please sign in again.');
      }
      if (event === 'SIGNED_OUT') signingOut.current = false;
      hadSession.current = Boolean(nextSession);
      setSession(nextSession);
    });

    // getSession() waits for Supabase to finish starting up (including any
    // email-link code exchange), so there is no flash of the sign-in screen.
    supabase.auth
      .getSession()
      .then(({ data: result, error }) => {
        if (!active) return;
        const restored = result?.session ?? null;
        hadSession.current = Boolean(restored);
        setSession(restored);

        if (consumeRecoveryFlag() || (redirect.isRecovery && restored)) setRecovery(true);

        if (redirect.errorCode) {
          setNotice(friendlyAuthError({ code: redirect.errorCode }));
        } else if (redirect.hasAuthParams && !restored) {
          setNotice(friendlyAuthError({ code: redirect.isRecovery ? 'recovery_link_failed' : 'flow_state_not_found' }));
        } else if (error) {
          setNotice(friendlyAuthError(error));
        }
        if (redirect.hasAuthParams) cleanAuthParamsFromUrl();
      })
      .catch((error) => {
        if (active) setNotice(friendlyAuthError(error));
      })
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user ?? null;
  const userId = user?.id ?? null;

  // 2. A signed-in user is never also a guest --------------------------------
  useEffect(() => {
    if (userId) {
      writeGuestFlag(false);
      setGuest(false);
    }
  }, [userId]);

  // 3. Load the profile (name) for the signed-in user ------------------------
  useEffect(() => {
    if (!supabase || !userId) {
      setProfile(null);
      return undefined;
    }
    let active = true;
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active && data) setProfile(data);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  // Actions -----------------------------------------------------------------
  // Each returns { error: 'friendly message', code } on failure.

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { error: 'Accounts are not available in this build.' };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { error: friendlyAuthError(error), code: error.code };
    setNotice('');
    return {};
  }, []);

  /** Returns { outcome: 'signedIn' | 'checkEmail' } or { error }. */
  const signUp = useCallback(async ({ fullName, email, password }) => {
    if (!supabase) return { error: 'Accounts are not available in this build.' };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim() },
        emailRedirectTo: siteUrl('?flow=signup'),
      },
    });
    if (error) return { error: friendlyAuthError(error), code: error.code };
    // With email confirmation on, Supabase hides duplicate sign-ups by returning
    // a user with no identities instead of an error.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      return { error: friendlyAuthError({ code: 'user_already_exists' }), code: 'user_already_exists' };
    }
    setNotice('');
    return { outcome: data.session ? 'signedIn' : 'checkEmail' };
  }, []);

  const resendVerification = useCallback(async (email) => {
    if (!supabase) return { error: 'Accounts are not available in this build.' };
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: siteUrl('?flow=signup') },
    });
    return error ? { error: friendlyAuthError(error) } : {};
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    if (!supabase) return { error: 'Accounts are not available in this build.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: siteUrl('?flow=recovery'),
    });
    return error ? { error: friendlyAuthError(error), code: error.code } : {};
  }, []);

  const updatePassword = useCallback(async (password) => {
    if (!supabase) return { error: 'Accounts are not available in this build.' };
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: friendlyAuthError(error), code: error.code } : {};
  }, []);

  const finishRecovery = useCallback(() => setRecovery(false), []);

  const signOut = useCallback(async () => {
    writeGuestFlag(false);
    setGuest(false);
    setRecovery(false);
    setNotice('');
    if (!supabase) return {};
    signingOut.current = true;
    // 'local' signs out this browser and works even when offline.
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      // Make sure the user is signed out of the UI regardless.
      setSession(null);
      signingOut.current = false;
    }
    return {};
  }, []);

  const continueAsGuest = useCallback(() => {
    writeGuestFlag(true);
    setGuest(true);
    setNotice('');
  }, []);

  /** Guest -> back to the sign-in screen (guest history stays in this browser). */
  const leaveGuest = useCallback(() => {
    writeGuestFlag(false);
    setGuest(false);
  }, []);

  const clearNotice = useCallback(() => setNotice(''), []);

  const status = resolveAccessStatus({ ready, session, guest });

  const value = useMemo(
    () => ({
      status,
      configured: isSupabaseConfigured,
      user,
      userId,
      name: user ? displayName(user, profile) : '',
      email: user?.email ?? '',
      recovery: recovery && Boolean(user),
      notice,
      signIn,
      signUp,
      signOut,
      resendVerification,
      requestPasswordReset,
      updatePassword,
      finishRecovery,
      continueAsGuest,
      leaveGuest,
      clearNotice,
    }),
    [
      status,
      user,
      userId,
      profile,
      recovery,
      notice,
      signIn,
      signUp,
      signOut,
      resendVerification,
      requestPasswordReset,
      updatePassword,
      finishRecovery,
      continueAsGuest,
      leaveGuest,
      clearNotice,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
