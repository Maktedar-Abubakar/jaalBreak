// ---------------------------------------------------------------------------
// Renders the analysed message with each verified evidence span highlighted.
// The text shown is exactly result.text — the same string the quotes were
// verified against — so every highlight is grounded in the user's message.
// ---------------------------------------------------------------------------

function buildSegments(text, signals) {
  const segments = [];
  let cursor = 0;
  const ordered = [...signals].sort((a, b) => a.start - b.start);
  for (const signal of ordered) {
    if (signal.start < cursor) continue; // safety: never render overlaps
    if (signal.start > cursor) segments.push({ type: 'text', value: text.slice(cursor, signal.start) });
    segments.push({ type: 'mark', value: text.slice(signal.start, signal.end), signal });
    cursor = signal.end;
  }
  if (cursor < text.length) segments.push({ type: 'text', value: text.slice(cursor) });
  return segments;
}

export default function EvidenceText({ text, signals, selectedId, onSelect, interactive = true }) {
  const segments = buildSegments(text, signals);
  return (
    <div className="evidence-text" lang="mul">
      {segments.map((segment, index) => {
        if (segment.type === 'text') return <span key={index}>{segment.value}</span>;
        const { signal } = segment;
        const className = `mark mark--sev${signal.severity} ${selectedId === signal.id ? 'is-selected' : ''}`;
        if (!interactive) {
          return (
            <mark key={index} className={className} title={signal.tacticLabel}>
              {segment.value}
            </mark>
          );
        }
        // A <mark> with button behaviour (not a <button>) so long phrases wrap
        // naturally across lines like the rest of the text.
        const select = () => onSelect && onSelect(signal.id);
        return (
          <mark
            key={index}
            role="button"
            tabIndex={0}
            className={`${className} mark--interactive`}
            onClick={select}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select();
              }
            }}
            aria-pressed={selectedId === signal.id}
            aria-label={`Highlighted phrase: ${segment.value}. Tactic: ${signal.tacticLabel}`}
          >
            {segment.value}
          </mark>
        );
      })}
    </div>
  );
}
