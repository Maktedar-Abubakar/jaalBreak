// "What happens next": shows the rest of the scam playbook for the detected
// category, and whether the wording matches a known reported scam.
import { GitBranch, Library, ExternalLink, Sparkles } from './Icons.js';
import { getLibraryEntry, matchKnownScam } from '../data/scamLibrary.js';
import { navigate } from '../utils/useHashRoute.js';

export default function WhatHappensNext({ result }) {
  const band = result.band.key;
  const known = band === 'low' ? null : matchKnownScam(result.text);
  const entry = getLibraryEntry(result.category.key) || (known ? getLibraryEntry(known.category) : null);
  if (!entry || band === 'low') return null;

  return (
    <div className="panel next-steps-panel">
      <p className="eyebrow">If you go along with this message</p>
      <h3 className="panel__title panel__title--serif">What usually happens next</h3>
      <p className="muted">
        This is how the <strong>{entry.title.toLowerCase()}</strong> usually plays out. You are at step 1 — you can stop
        it here.
      </p>
      <ol className="scam-stages">
        {entry.stages.map((stage, i) => (
          <li key={stage} className={i === entry.stages.length - 1 ? 'is-loss' : ''}>
            <span className="scam-stages__num">{i + 1}</span>
            <span>{stage}</span>
          </li>
        ))}
      </ol>

      {known && (
        <div className="known-match">
          <Sparkles size={16} aria-hidden="true" />
          <p>
            <strong>Looks like a known scam:</strong> {known.title}. Your message shares {known.overlap}% of its wording
            with a reported example. <span className="muted">(Word overlap, not a probability.)</span>
          </p>
        </div>
      )}

      <div className="button-row">
        {entry.simulatorId && (
          <button type="button" className="btn btn--secondary" onClick={() => navigate('simulator', entry.simulatorId)}>
            <GitBranch size={16} aria-hidden="true" /> Practise this scam safely
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={() => navigate('library', entry.category)}>
          <Library size={16} aria-hidden="true" /> Read about this scam
        </button>
        {(entry.links || []).map((l) => (
          <a key={l.url} className="btn btn--ghost" href={l.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={15} aria-hidden="true" /> {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
