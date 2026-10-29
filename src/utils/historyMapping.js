// ---------------------------------------------------------------------------
// Convert between JaalBreak's history record (used by the History and
// Overview pages) and a row in the Supabase `scan_history` table.
//
// PRIVACY: only the SUMMARY is sent to the database — never the message text,
// evidence quotes, screenshots or links. This is enforced here: recordToRow
// copies a fixed list of fields, so `text` / `phrases` cannot slip through.
// ---------------------------------------------------------------------------

const BAND_KEYS = ['low', 'medium', 'high'];
const clip = (value, max) => (value == null ? null : String(value).slice(0, max));

/** Record (from storage.toRecord) -> database row. user_id is filled by the database. */
export function recordToRow(record) {
  const riskLevel = BAND_KEYS.includes(record.bandKey) ? record.bandKey : 'low';
  return {
    risk_level: riskLevel,
    risk_label: clip(record.band, 120),
    scam_category: clip(record.categoryKey, 60),
    category_label: clip(record.category, 120),
    matched_checks: Number.isFinite(record.matchedChecks) ? Math.max(0, Math.trunc(record.matchedChecks)) : 0,
    tactics: Array.isArray(record.tactics) ? record.tactics.slice(0, 20).map((t) => clip(t, 80)) : [],
    input_source: clip(record.source, 30),
    language: clip(record.language, 40),
    rules_version: clip(record.rulesVersion, 20),
    analyzed_at: record.date || new Date().toISOString(),
  };
}

/** Database row -> record shape the pages already understand. */
export function rowToRecord(row) {
  return {
    id: row.id,
    date: row.analyzed_at || row.created_at,
    categoryKey: row.scam_category || 'unknown',
    category: row.category_label || 'Uncategorised',
    bandKey: row.risk_level,
    band: row.risk_label || row.risk_level,
    matchedChecks: row.matched_checks ?? 0,
    tactics: Array.isArray(row.tactics) ? row.tactics : [],
    source: row.input_source || null,
    language: row.language || null,
    rulesVersion: row.rules_version || null,
    hasText: false,
    cloud: true,
  };
}

/** Columns we ask the database for (never `*`, so new columns are opt-in). */
export const HISTORY_COLUMNS =
  'id, risk_level, risk_label, scam_category, category_label, matched_checks, tactics, input_source, language, rules_version, analyzed_at, created_at';
