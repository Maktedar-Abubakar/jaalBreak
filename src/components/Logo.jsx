// JaalBreak wordmark: an original mark — a net (jaal) with one strand broken.
export default function Logo({ inverse = true }) {
  return (
    <span className={`logo ${inverse ? 'logo--inverse' : ''}`}>
      <svg className="logo__mark" viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <circle cx="16" cy="16" r="12.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M6 12.5h20M6 19.5h20M12.5 4.5v23M19.5 4.5v8.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <path d="M19.5 17v10.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <path d="m17.2 15.8 4.6-1.6" stroke="#4fb3aa" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span className="logo__word">
        Jaal<span>Break</span>
      </span>
    </span>
  );
}
