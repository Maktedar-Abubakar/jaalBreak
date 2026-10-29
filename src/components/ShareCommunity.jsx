// "Warn others": share an anonymous summary to the community scam map.
import { useEffect, useState } from 'react';
import { Megaphone, CircleCheck } from './Icons.js';
import { CHANNELS, buildCommunityReport, shareCommunityReport, communityAvailable } from '../lib/community.js';

export default function ShareCommunity({ result }) {
  const [channel, setChannel] = useState(result.source === 'call' ? 'call' : 'whatsapp');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  useEffect(() => {
    setStatus('idle');
    setError('');
  }, [result]);
  if (result.band.key === 'low') return null;
  const preview = buildCommunityReport(result, channel);

  const share = async () => {
    setStatus('sending');
    setError('');
    try {
      await shareCommunityReport(result, channel);
      setStatus('done');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  };

  return (
    <div className="panel share-community">
      <p className="eyebrow">Warn others</p>
      <h3 className="panel__title">Add this scam to the community trends</h3>
      {status === 'done' ? (
        <p className="share-community__done">
          <CircleCheck size={16} aria-hidden="true" /> Thank you — shared anonymously. See <a href="#/trends">Scam Trends</a>.
        </p>
      ) : (
        <>
          <p className="muted">
            Only this is shared: <strong>{result.category.label}</strong>, the risk level, {preview.tactics.length} tactic name
            {preview.tactics.length === 1 ? '' : 's'}, the language and where it arrived.{' '}
            <strong>Never the message, links, numbers or who you are.</strong>
          </p>
          <div className="button-row">
            <label className="field field--inline">
              <span className="field__label">Where did it arrive?</span>
              <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNELS.map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="btn btn--secondary" onClick={share} disabled={!communityAvailable || status === 'sending'}>
              <Megaphone size={16} aria-hidden="true" /> {status === 'sending' ? 'Sharing…' : 'Share anonymously'}
            </button>
          </div>
          {!communityAvailable && <p className="fine-print">Community sharing needs the online database, which isn’t set up in this version.</p>}
          {error && <p className="field-error" role="alert">{error}</p>}
        </>
      )}
    </div>
  );
}
