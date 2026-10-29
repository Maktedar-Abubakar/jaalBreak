// ---------------------------------------------------------------------------
// Tiny hash router: URLs look like  #/analyze  or  #/simulator/bank-kyc
// Using the hash means the app works from any static host with no server
// configuration, and the browser Back button works.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';

export const PAGES = ['overview', 'analyze', 'xray', 'simulator', 'library', 'trends', 'history', 'act', 'privacy'];
// Sign-in screens. These are shown instead of the app shell (see App.jsx).
export const AUTH_PAGES = ['login', 'signup', 'forgot'];

export function parseHash(hash) {
  const parts = String(hash || '')
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean);
  const page = PAGES.includes(parts[0]) || AUTH_PAGES.includes(parts[0]) ? parts[0] : 'overview';
  return { page, param: parts[1] || null };
}

export function navigate(page, param) {
  const target = `#/${page}${param ? `/${param}` : ''}`;
  if (typeof window !== 'undefined' && window.location.hash !== target) {
    window.location.hash = target;
  }
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => (typeof window !== 'undefined' ? parseHash(window.location.hash) : parseHash('')));
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
