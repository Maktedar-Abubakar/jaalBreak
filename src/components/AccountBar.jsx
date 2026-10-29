// ---------------------------------------------------------------------------
// Slim bar at the top of every page showing who is using JaalBreak:
//   - Guest Mode (with sign-in / create-account links), or
//   - the signed-in user's name, with a Sign out button.
// ---------------------------------------------------------------------------

import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider.jsx';
import { firstName } from '../utils/authValidation.js';
import { UserRound, LogOut, LogIn, UserPlus, Cloud, CloudOff, LoaderCircle, X } from './Icons.js';

export default function AccountBar({ cloudState, onDismissNotice }) {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);

  if (auth.status === 'guest') {
    return (
      <div className="account-bar account-bar--guest" role="region" aria-label="Account">
        <div className="account-bar__who">
          <span className="mode-pill">
            <UserRound size={14} aria-hidden="true" /> Guest Mode
          </span>
          <span className="account-bar__note">
            History is saved only in this browser and is lost if browser data is cleared.
          </span>
        </div>
        <div className="account-bar__actions">
          <a href="#/login" className="btn btn--ghost btn--sm">
            <LogIn size={15} aria-hidden="true" /> Sign in
          </a>
          <a href="#/signup" className="btn btn--secondary btn--sm">
            <UserPlus size={15} aria-hidden="true" /> Create account
          </a>
        </div>
      </div>
    );
  }

  if (auth.status !== 'authenticated') return null;

  const signOut = async () => {
    setBusy(true);
    await auth.signOut();
    setBusy(false);
  };

  return (
    <div className="account-bar" role="region" aria-label="Account">
      <div className="account-bar__who">
        <span className="avatar" aria-hidden="true">
          {firstName(auth.name).charAt(0).toUpperCase()}
        </span>
        <span className="account-bar__greeting">
          <strong>Hello, {firstName(auth.name)}</strong>
          <span className="account-bar__email">{auth.email}</span>
        </span>
        <SyncStatus state={cloudState} />
      </div>
      <div className="account-bar__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={signOut} disabled={busy}>
          {busy ? <LoaderCircle size={15} className="spin" aria-hidden="true" /> : <LogOut size={15} aria-hidden="true" />}
          Sign out
        </button>
      </div>
      {cloudState?.error && (
        <div className="account-bar__alert" role="alert">
          <CloudOff size={15} aria-hidden="true" />
          <span>{cloudState.error}</span>
          <button type="button" className="icon-button" onClick={onDismissNotice} aria-label="Dismiss message">
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function SyncStatus({ state }) {
  if (!state) return null;
  if (state.status === 'loading') {
    return (
      <span className="sync-status">
        <LoaderCircle size={13} className="spin" aria-hidden="true" /> Loading history…
      </span>
    );
  }
  if (state.status === 'offline') {
    return (
      <span className="sync-status sync-status--warn">
        <CloudOff size={13} aria-hidden="true" /> History unavailable
      </span>
    );
  }
  return (
    <span className="sync-status">
      <Cloud size={13} aria-hidden="true" /> History saved to your account
    </span>
  );
}
