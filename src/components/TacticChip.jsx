import { getTactic } from '../data/tactics.js';

export default function TacticChip({ tactic, full = false }) {
  const t = getTactic(tactic);
  return <span className="tactic-chip">{full ? t.label : t.short}</span>;
}
