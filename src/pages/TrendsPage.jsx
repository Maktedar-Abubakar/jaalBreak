// Scam Trends: community totals (anonymous) + a dashboard of your own checks.
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import TrendingPanel from '../components/TrendingPanel.jsx';
import { fetchDaily, communityAvailable } from '../lib/community.js';

function countBy(list, key) {
  const m = new Map();
  for (const r of list) m.set(r[key], (m.get(r[key]) || 0) + 1);
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

function Bars({ rows }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  return (
    <ol className="bars">
      {rows.map(([label, n]) => (
        <li key={label}>
          <span className="bars__label">{label}</span>
          <span className="bars__track"><span style={{ width: `${(100 * n) / max}%` }} /></span>
          <span className="bars__num">{n}</span>
        </li>
      ))}
    </ol>
  );
}

export default function TrendsPage({ history }) {
  const [days, setDays] = useState(7);
  const [daily, setDaily] = useState([]);
  useEffect(() => {
    if (!communityAvailable) return;
    fetchDaily(Math.max(days, 7)).then(setDaily).catch(() => setDaily([]));
  }, [days]);

  const mine = useMemo(() => {
    const list = Array.isArray(history) ? history : [];
    const since = Date.now() - 30 * 86400000;
    const recent = list.filter((r) => r?.date && !isNaN(new Date(r.date).getTime()) && new Date(r.date).getTime() >= since);
    const flagged = recent.filter((r) => r.bandKey !== 'low');
    return { total: recent.length, flagged: flagged.length, byCategory: countBy(flagged, 'category'), byBand: countBy(recent, 'band') };
  }, [history]);
  const maxDay = Math.max(1, ...daily.map((d) => d.reports));

  return (
    <div className="page">
      <PageHeader
        eyebrow="Scam Trends"
        title="What scams are going around"
        lede="Community totals come from people who chose to share a check anonymously — only the scam type, risk level and channel, never the message. Your own dashboard below never leaves your device or account."
      />
      <section className="panel">
        <div className="panel__head">
          <h2 className="panel__title">Community</h2>
          <div className="lang-switch" role="group" aria-label="Period">
            {[7, 30].map((d) => (
              <button key={d} type="button" className={`lang-switch__btn ${days === d ? 'is-active' : ''}`} aria-pressed={days === d} onClick={() => setDays(d)}>
                {d} days
              </button>
            ))}
          </div>
        </div>
        <TrendingPanel days={days} limit={12} />
        {daily.length > 0 && (
          <>
            <p className="mini-label">Reports per day</p>
            <div className="daybars" role="img" aria-label="Reports per day">
              {daily.map((d) => (
                <span key={d.day} title={`${d.day}: ${d.reports}`} style={{ height: `${(100 * d.reports) / maxDay}%` }} />
              ))}
            </div>
          </>
        )}
      </section>

      <section className="panel">
        <h2 className="panel__title">Your checks — last 30 days</h2>
        <div className="stat-row">
          <div className="stat"><span className="stat__num">{mine.total}</span><span className="stat__label">messages checked</span></div>
          <div className="stat"><span className="stat__num">{mine.flagged}</span><span className="stat__label">with warning signs</span></div>
          <div className="stat"><span className="stat__num">{mine.byCategory.length}</span><span className="stat__label">scam types seen</span></div>
        </div>
        {mine.byCategory.length > 0 ? (
          <>
            <p className="mini-label">Scam types you were sent</p>
            <Bars rows={mine.byCategory} />
            <p className="mini-label">Assessments</p>
            <Bars rows={mine.byBand} />
          </>
        ) : (
          <p className="muted">Nothing flagged yet in the last 30 days. Checks you run appear here (if history saving is on).</p>
        )}
      </section>
    </div>
  );
}
