// Three-segment risk indicator. Shows a band, never a percentage.
export default function RiskBand({ band, size = 'md' }) {
  if (!band) return null;
  return (
    <div className={`risk-band risk-band--${band.key} risk-band--${size}`}>
      <div className="risk-band__meter" aria-hidden="true">
        {[1, 2, 3].map((level) => (
          <span key={level} className={level <= band.level ? 'is-on' : ''} />
        ))}
      </div>
      <span className="risk-band__label">{size === 'sm' ? band.short : band.label}</span>
    </div>
  );
}

export function BandPill({ bandKey, label }) {
  return <span className={`band-pill band-pill--${bandKey}`}>{label}</span>;
}
