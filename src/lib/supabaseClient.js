// ---------------------------------------------------------------------------
// The ONE place the Supabase client is created.
//
// It reads two values from environment variables (see .env.example):
//   VITE_SUPABASE_URL              e.g. https://abcd1234.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY  e.g. sb_publishable_...
//
// The publishable key is designed to be used in the browser. Security comes
// from Row Level Security (RLS) in the database (see supabase/schema.sql).
// NEVER put a service-role / secret key here or in any VITE_ variable.
//
// If either value is missing, `supabase` is null and the app runs in
// guest-only mode instead of crashing.
// ---------------------------------------------------------------------------

import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured
  ? createClient(url, key, {
      auth: {
        // PKCE puts `?code=...` in the query string after email links, which
        // does not clash with JaalBreak's `#/page` hash router.
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // Shown only in the developer console, never to users.
  console.warn(
    '[JaalBreak] Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local. ' +
      'Accounts are disabled; guest mode still works.'
  );
}

// Supabase can announce a password-recovery link while it is still starting
// up — before React has mounted. Record it here so the app never misses it.
let recoveryPending = false;
if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') recoveryPending = true;
  });
}

export function consumeRecoveryFlag() {
  const was = recoveryPending;
  recoveryPending = false;
  return was;
}

/** Where Supabase should send people back to after clicking an email link. */
export function siteUrl(params = '') {
  if (typeof window === 'undefined') return `/${params}`;
  const origin = window.location.origin;
  const cleanParams = params.startsWith('/') ? params.slice(1) : params;
  return cleanParams ? `${origin}/${cleanParams}` : origin;
}
