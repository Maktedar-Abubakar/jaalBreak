// Community "trending now" list: totals only, from supabase/community.sql.
import { useEffect, useState } from 'react';
import { TrendingUp, LoaderCircle } from './Icons.js';
import { CATEGORY_LABELS } from '../data/rules.js';
import { fetchTrending, communityAvailable } from '../lib/community.js';

export default function TrendingPanel({ days = 7, limit = 5, compact = false }) {
  const [state, setState] = useState({ status: communityAvailable ? 'loading' : 'off', rows: [], error: '' });
  useEffect(() => {
    if (!communityAvailable) return undefined;
    let live = true;
    setState((s) => ({ ...s, status: 'loading' }));
    fetchTrending(days)
      .then((rows) => live && setState({ status: 'ready', rows, error: '' }))
      .catch((e) => live && setState({ status: 'error', rows: [], error: e.message }));
    return () => {
      live = false;
    };
  }, [days]);

  const max = Math.max(1, ...state.rows.map((r) => r.reports));
  return (
    <div className={`trending ${compact ? 'trending--compact' : ''}`}>
      <p className="eyebrow">
        <TrendingUp size={14} aria-hidden="true" /> Trending — last {days} days
      </p>
      {state.status === 'off' && <p className="muted">Community trends appear here once the online database is set up.</p>}
      {state.status === 'loading' && (
        <p className="muted">
          <LoaderCircle size={14} className="spin" aria-hidden="true" /> Loading…
        </p>
      )}
      {state.status === 'error' && <p className="muted">{state.error}</p>}
      {state.status === 'ready' && state.rows.length === 0 && <p className="muted">No reports yet. Be the first to warn others after a check.</p>}
      {state.status === 'ready' && state.rows.length > 0 && (
        <ol className="bars">
          {state.rows.slice(0, limit).map((r) => (
            <li key={r.category}>
              <a href={`#/library/${r.category}`} className="bars__label">{CATEGORY_LABELS[r.category] || r.category}</a>
              <span className="bars__track"><span style={{ width: `${(100 * r.reports) / max}%` }} /></span>
              <span className="bars__num">{r.reports}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
