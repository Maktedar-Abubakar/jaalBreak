// Scam Library: one card per scam type — how it works, red flags, a real-style
// example you can analyse, and what to do.
import { useEffect } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import { SCAM_LIBRARY } from '../data/scamLibrary.js';
import { CATEGORY_ADVICE } from '../data/advice.js';
import { GitBranch, ScanSearch, ExternalLink, TriangleAlert } from '../components/Icons.js';
import { navigate } from '../utils/useHashRoute.js';

export default function LibraryPage({ focus, onAnalyzeExample }) {
  useEffect(() => {
    if (!focus) return;
    const el = document.getElementById(`scam-${focus}`);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, [focus]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Scam Library"
        title="How each scam works — and where to break it"
        lede="Every scam follows a script. Learn the script once and you will recognise it in any language. Each card shows the steps, the red flags and a real-style example you can run through JaalBreak."
      />
      <nav className="library-index" aria-label="Scam types">
        {SCAM_LIBRARY.map((e) => (
          <a key={e.category} href={`#/library/${e.category}`} className={`chip ${focus === e.category ? 'is-active' : ''}`}>
            {e.title}
          </a>
        ))}
      </nav>
      <div className="library-grid">
        {SCAM_LIBRARY.map((e) => {
          const advice = CATEGORY_ADVICE[e.category];
          return (
            <article key={e.category} id={`scam-${e.category}`} className={`panel library-card ${focus === e.category ? 'is-focus' : ''}`}>
              <h2 className="panel__title panel__title--serif">{e.title}</h2>
              <p>{e.oneLine}</p>
              <p className="mini-label">How it plays out</p>
              <ol className="scam-stages scam-stages--compact">
                {e.stages.map((s, i) => (
                  <li key={s} className={i === e.stages.length - 1 ? 'is-loss' : ''}>
                    <span className="scam-stages__num">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mini-label">Red flags</p>
              <ul className="flag-list">
                {e.redFlags.map((f) => (
                  <li key={f}>
                    <TriangleAlert size={14} aria-hidden="true" /> {f}
                  </li>
                ))}
              </ul>
              <p className="mini-label">Example</p>
              <blockquote className="example-message">{e.examples[0]}</blockquote>
              {advice && (
                <>
                  <p className="mini-label">What to do</p>
                  <p className="library-card__advice">{advice.headline}</p>
                </>
              )}
              <div className="button-row">
                <button type="button" className="btn btn--secondary" onClick={() => onAnalyzeExample(e.examples[0], 'sample')}>
                  <ScanSearch size={16} aria-hidden="true" /> Analyse this example
                </button>
                {e.simulatorId && (
                  <button type="button" className="btn btn--ghost" onClick={() => navigate('simulator', e.simulatorId)}>
                    <GitBranch size={16} aria-hidden="true" /> Practise it
                  </button>
                )}
                {(e.links || []).map((l) => (
                  <a key={l.url} className="btn btn--ghost" href={l.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={15} aria-hidden="true" /> {l.label}
                  </a>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
