// ---------------------------------------------------------------------------
// Local history and settings, stored ONLY in this browser's localStorage.
// Nothing is uploaded, synced or encrypted. Clearing browser data removes it.
//
// By default we store a SUMMARY of each analysis (date, category, assessment,
// tactic names). The full message text and evidence phrases are stored only
// if the user turns on "Save full message text" in Privacy & Method.
// ---------------------------------------------------------------------------

export const HISTORY_KEY = 'scamshield.history.v1';
export const SETTINGS_KEY = 'scamshield.settings.v1';
export const MAX_RECORDS = 50;

export const DEFAULT_SETTINGS = {
  saveHistory: true,
  saveFullText: false,
  simpleMode: false,
};

function safeRead(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadSettings() {
  const stored = safeRead(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...(stored && typeof stored === 'object' ? stored : {}) };
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function saveSettings(settings) {
  // Default settings are not written, so "Delete all data" leaves storage truly empty.
  const isDefault = Object.keys(DEFAULT_SETTINGS).every((k) => settings[k] === DEFAULT_SETTINGS[k]);
  return isDefault ? safeRemove(SETTINGS_KEY) : safeWrite(SETTINGS_KEY, settings);
}

export function loadHistory() {
  const stored = safeRead(HISTORY_KEY, []);
  return Array.isArray(stored) ? stored : [];
}

export function saveHistory(records) {
  if (!records.length) return safeRemove(HISTORY_KEY);
  return safeWrite(HISTORY_KEY, records.slice(0, MAX_RECORDS));
}

/** Turn an analysis result into a history record. */
export function toRecord(result, settings) {
  const record = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: result.analyzedAt,
    categoryKey: result.category.key,
    category: result.category.label,
    bandKey: result.band.key,
    band: result.band.label,
    matchedChecks: result.matchedChecks,
    tactics: [...new Set(result.signals.map((s) => s.tacticLabel))],
    source: result.source,
    language: result.language.label,
    rulesVersion: result.rulesVersion,
    hasText: false,
  };
  if (settings.saveFullText) {
    record.hasText = true;
    record.text = result.text;
    record.phrases = result.signals.map((s) => ({ quote: s.quote, tactic: s.tacticLabel }));
  }
  return record;
}

export const LANG_KEY = 'jaalbreak.lang.v1';

export function clearAllJaalBreakData() {
  const a = safeRemove(HISTORY_KEY);
  const b = safeRemove(SETTINGS_KEY);
  const c = safeRemove(LANG_KEY);
  return a && b && c;
}
