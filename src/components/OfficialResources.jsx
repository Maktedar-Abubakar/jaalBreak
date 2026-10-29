import { ExternalLink, Phone } from './Icons.js';
import { OFFICIAL_RESOURCES, RESOURCES_LAST_REVIEWED } from '../data/officialResources.js';

export default function OfficialResources({ compact = false }) {
  return (
    <div className={`resources ${compact ? 'resources--compact' : ''}`}>
      <ul className="resources__list">
        {OFFICIAL_RESOURCES.map((r) => (
          <li key={r.id} className="resource">
            <div className="resource__body">
              <p className="resource__name">{r.name}</p>
              {!compact && <p className="resource__owner">{r.owner}</p>}
              <p className="resource__when">{r.when}</p>
            </div>
            <a
              className="btn btn--secondary btn--sm resource__link"
              href={r.url}
              {...(r.kind === 'link' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {r.kind === 'phone' ? <Phone size={15} aria-hidden="true" /> : <ExternalLink size={15} aria-hidden="true" />}
              {r.display}
            </a>
          </li>
        ))}
      </ul>
      <p className="fine-print">
        Links reviewed on {RESOURCES_LAST_REVIEWED}. JaalBreak does not file complaints for you and cannot recover money.
      </p>
    </div>
  );
}
