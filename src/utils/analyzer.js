// ---------------------------------------------------------------------------
// JaalBreak Evidence-First Analyzer
//
// Pipeline:
//   input  →  normalise  →  rule engine  →  overlap resolution
//          →  quote/span verification  →  risk band + category  →  advice
//
// Design rules (from the engineering report):
//   • Deterministic: the same text + the same rules always gives the same band.
//   • Every evidence quote must be an exact substring of the analysed text.
//   • No percentages or "probability of scam" — only counts of matched checks.
//   • Never says a message is safe or definitely fraudulent.
//
// DOCUMENTED NORMALISATION
//   The analysed text (what X-Ray displays and what every quote is verified
//   against) is the user's text after two steps only:
//     1. Unicode NFC normalisation (so visually identical Hindi characters match).
//     2. Windows/Mac line endings (\r\n, \r) converted to \n.
//   Rules, however, run on a MATCH VIEW of that text (see buildMatchView):
//     - NFKC folds look-alike forms (full-width letters, ligatures),
//     - zero-width and soft-hyphen characters are removed,
//     - single line breaks become spaces (SMS wrapping, OCR output).
//   Every match is mapped back to exact positions in the analysed text, so quotes
//   are still verbatim substrings of what the user sees.
//   Matching is case-insensitive.
// ---------------------------------------------------------------------------

import { RULES, CATEGORY_LABELS } from '../data/rules.js';
import { getTactic } from '../data/tactics.js';
import { CATEGORY_ADVICE, UNIVERSAL_STEPS } from '../data/advice.js';
import { extractLinks, assessLink } from './linkCheck.js';

export const RULES_VERSION = '1.2.0';
export const MAX_INPUT_LENGTH = 5000;

export const BANDS = {
  high: {
    key: 'high',
    label: 'Strong match for a known scam pattern',
    short: 'Strong indicators',
    level: 3,
  },
  medium: {
    key: 'medium',
    label: 'Several warning signs',
    short: 'Several warning signs',
    level: 2,
  },
  low: {
    key: 'low',
    label: 'Few warning signs found',
    short: 'Few warning signs',
    level: 1,
  },
};

// Thresholds are deliberately simple so they are easy to explain on stage.
export const THRESHOLDS = {
  high: 7, // total severity of distinct matched checks
  medium: 3,
  strongChecksForHigh: 2, // OR at least this many severity-3 checks
};

// ---- Negation (clause-aware) ------------------------------------------------
// A match is ignored when it sits inside a prohibition such as "we will never ask
// you to share your OTP". The negator must be in the SAME clause (a clause ends at
// . ! ? ; a line break, or a word like "but"), and it must not be followed by words
// that turn the sentence back into an instruction ("do not hesitate to share...").
const CLAUSE_BREAK = /[.!?;\n।]|\b(?:but|however|though|although|yet)\b/giu;
const NEGATOR_EN =
  /\b(?:never|do not|does not|did not|don['’]?t|won['’]?t|will not|should not|shouldn['’]?t|must not|can['’]?t|cannot|not to|no one|nobody|kabhi|mat|nahi|nahin)\b/giu;
const NEGATION_CANCEL = /\b(?:and|then|so|just|simply|worry|hesitate|delay|wait|ignore|forget|panic|fear)\b/iu;
const NEGATOR_HI = /(?:कभी|मत|नहीं|(?:^|\s)न(?:\s|$))/u;
const NEGATOR_HG = /\b(?:kabhi|mat|nahi|nahin)\b/iu;
const NEGATOR_KN = /ಬೇಡ/u;
const NEGATOR_KG = /\b(?:beda|bedi|madbedi|maadbedi|kodbedi|helbedi|yarigu)\b/iu;
const NEGATION_LOOKBACK = 120;
const NEGATION_MAX_GAP = 60;

export function normaliseInput(raw) {
  return String(raw ?? '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n');
}

const INVISIBLE_RE = /[\u200B-\u200D\u2060\uFEFF\u00AD]/u;
const HIDDEN_CHARS_RE = /[\u200B-\u200D\u2060\uFEFF]/u;
const FULLWIDTH_LETTER_RE = /[\uFF21-\uFF3A\uFF41-\uFF5A]/u;

/**
 * Build the string the rules actually run on, plus maps that translate every
 * position in it back to the analysed text. Exported for testing.
 */
export function buildMatchView(text) {
  let match = '';
  const startMap = [];
  const endMap = [];
  let i = 0;
  while (i < text.length) {
    const ch = String.fromCodePoint(text.codePointAt(i));
    const next = i + ch.length;
    let piece;
    if (INVISIBLE_RE.test(ch)) piece = '';
    else if (ch === '\n') piece = text[i - 1] === '\n' || text[next] === '\n' ? '\n' : ' ';
    else piece = ch.normalize('NFKC');
    for (let k = 0; k < piece.length; k += 1) {
      startMap.push(i);
      endMap.push(next);
    }
    match += piece;
    i = next;
  }
  return { match, startMap, endMap };
}

function clauseBefore(view, start) {
  const before = view.slice(Math.max(0, start - NEGATION_LOOKBACK), start);
  let cut = 0;
  for (const m of before.matchAll(CLAUSE_BREAK)) cut = m.index + m[0].length;
  return before.slice(cut);
}

function isNegated(view, start, end, lang) {
  const clause = clauseBefore(view, start);
  let last = null;
  for (const m of clause.matchAll(NEGATOR_EN)) last = m;
  if (last) {
    const gap = clause.slice(last.index + last[0].length);
    if (gap.length <= NEGATION_MAX_GAP && !NEGATION_CANCEL.test(gap)) return true;
  }
  if (NEGATOR_HI.test(clause)) return true;
  // The negator can also sit INSIDE the match (Hindi: "OTP कभी किसी को न बताएं").
  const inner = view.slice(start, end);
  if (lang === 'hi' && NEGATOR_HI.test(inner)) return true;
  if (lang === 'hinglish' && NEGATOR_HG.test(inner)) return true;
  if (lang === 'kn' && NEGATOR_KN.test(inner)) return true;
  if (lang === 'kanglish' && NEGATOR_KG.test(inner)) return true;
  return false;
}

function toGlobal(pattern) {
  const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
  return new RegExp(pattern.source, flags);
}

// Trim spaces from both ends of a match while keeping indices correct.
function tightenSpan(text, start, end) {
  let s = start;
  let e = end;
  while (s < e && /\s/u.test(text[s])) s += 1;
  while (e > s && /\s/u.test(text[e - 1])) e -= 1;
  return [s, e];
}

// Words that are almost never used in plain English; two or more suggest Hinglish.
const HINGLISH_MARKERS = [
  'aapka', 'apka', 'apna', 'turant', 'jaldi', 'bhejo', 'batao', 'batayein', 'karo', 'kijiye',
  'jayega', 'jayegi', 'warna', 'nahi', 'nahin', 'khata', 'paise', 'paisa', 'bharo', 'dijiye',
  'hai', 'abhi', 'kripya',
];

const KANGLISH_MARKERS = [
  'nimma', 'nimge', 'maadi', 'madi', 'aagutte', 'agutte', 'beku', 'illa', 'heli', 'kodi', 'kalsi',
  'eega', 'bega', 'inda', 'ninda', 'khate', 'maatadtiddini', 'madbeku', 'aaguttade', 'banni',
];

export function detectLanguage(text) {
  const devanagari = (text.match(/[ऀ-ॿ]/gu) || []).length;
  const latin = (text.match(/[A-Za-z]/g) || []).length;
  // Other Indian scripts (Bengali to Malayalam/Sinhala), Arabic, etc.
  const kannada = (text.match(/[ಀ-೿]/gu) || []).length;
  // Other Indian scripts (Bengali to Malayalam/Sinhala, minus Kannada), Arabic, etc.
  const otherScripts = (text.match(/[ঀ-೿ഀ-෿؀-ۿ฀-๿一-鿿]/gu) || []).length - kannada;
  const total = devanagari + latin + otherScripts + kannada || 1;

  if (kannada / total > 0.15) {
    const note = 'Kannada support is new (beta). Some Kannada scam wording may be missed.';
    if (latin / total > 0.1) return { code: 'kn-mixed', label: 'Kannada + English', supported: true, note };
    return { code: 'kn', label: 'Kannada', supported: true, note };
  }

  if (otherScripts / total > 0.15) {
    return {
      code: 'other',
      label: 'Unreviewed language',
      supported: false,
      note: 'Part of this message is in a language JaalBreak has not reviewed rules for (supported: English, Hindi, Hinglish and Kannada). Warnings may be missed.',
    };
  }
  if (devanagari > 0 && latin > 0 && devanagari / total > 0.1 && latin / total > 0.1) {
    return { code: 'mixed', label: 'Hindi + English', supported: true, note: null };
  }
  if (devanagari > latin) {
    return { code: 'hi', label: 'Hindi', supported: true, note: null };
  }
  const words = new Set(text.toLowerCase().match(/[a-z]+/g) || []);
  const hinglishHits = HINGLISH_MARKERS.filter((w) => words.has(w)).length;
  const kanglishHits = KANGLISH_MARKERS.filter((w) => words.has(w)).length;
  if (devanagari === 0 && kanglishHits >= 2 && kanglishHits > hinglishHits) {
    return { code: 'kanglish', label: 'Kannada in English letters', supported: true, note: 'Kannada support is new (beta).' };
  }
  if (devanagari === 0 && hinglishHits >= 2) {
    return { code: 'hinglish', label: 'Hinglish (Hindi in English letters)', supported: true, note: null };
  }
  return { code: 'en', label: 'English', supported: true, note: null };
}

function findRuleCandidates(view) {
  const candidates = [];
  const { match: text, startMap, endMap } = view;
  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      for (const match of text.matchAll(toGlobal(pattern))) {
        if (!match[0] || !match[0].trim()) continue;
        const [start, end] = tightenSpan(text, match.index, match.index + match[0].length);
        if (end <= start) continue;
        if (rule.negationGuard && isNegated(text, start, end, rule.lang)) continue;
        candidates.push({
          ruleId: rule.id,
          tactic: rule.tactic,
          severity: rule.severity,
          lang: rule.lang,
          description: rule.description,
          categories: rule.categories,
          start: startMap[start],
          end: endMap[end - 1],
        });
      }
    }
  }
  return candidates;
}

function findLinkCandidates(view) {
  const { match: text, startMap, endMap } = view;
  return extractLinks(text).map((link) => {
    const assessment = assessLink(link.url);
    return {
      ruleId: assessment.suspicious ? 'LNK-02' : 'LNK-01',
      tactic: assessment.suspicious ? 'suspicious_link' : 'link_present',
      severity: assessment.suspicious ? 3 : 1,
      lang: 'any',
      description: assessment.suspicious ? 'Link with suspicious characteristics' : 'Contains a link',
      categories: assessment.suspicious ? { bank_kyc: 1, delivery_fee: 1, general: 1 } : { general: 0 },
      start: startMap[link.start],
      end: endMap[link.end - 1],
      linkReasons: assessment.reasons,
      host: assessment.host,
    };
  });
}

// Keep the strongest, longest match when two matches overlap.
function resolveOverlaps(candidates) {
  const ordered = [...candidates].sort(
    (a, b) =>
      b.severity - a.severity ||
      b.end - b.start - (a.end - a.start) ||
      a.start - b.start ||
      a.ruleId.localeCompare(b.ruleId)
  );
  const accepted = [];
  for (const candidate of ordered) {
    const overlaps = accepted.some((kept) => candidate.start < kept.end && kept.start < candidate.end);
    if (!overlaps) accepted.push(candidate);
  }
  return accepted.sort((a, b) => a.start - b.start);
}

/**
 * Span verification. Every signal must quote text that actually exists in the
 * analysed message at the stated position. Anything else is discarded.
 * This also protects against any future optional AI explanation layer
 * inventing quotes.
 */
export function verifySignals(text, signals) {
  const verified = [];
  let discarded = 0;
  for (const signal of signals) {
    const atPosition = text.slice(signal.start, signal.end);
    const ok =
      typeof signal.quote === 'string' &&
      signal.quote.length > 0 &&
      atPosition === signal.quote &&
      text.includes(signal.quote);
    if (ok) verified.push({ ...signal, verified: true });
    else discarded += 1;
  }
  return { verified, discarded };
}

// Tactics that, when they appear together, make a message clearly more dangerous.
const REWARD_FOLLOW_UPS = new Set(['advance_fee', 'credential_request', 'payment_redirect', 'suspicious_link']);
// The repeat bonus only applies to tactics that carry a real demand or bait. Urgency
// wording or authority names repeated twice ("URGENT ... act now") prove nothing.
const REPEAT_BONUS_TACTICS = new Set([
  'reward_bait', 'unrealistic_offer', 'advance_fee', 'credential_request',
  'payment_redirect', 'blackmail', 'emotional_pressure',
]);
const MAX_BONUS = 3;
const HIDDEN_CHARS_POINTS = 2;

/**
 * Score = highest severity of each distinct rule, plus small, explained bonuses:
 *   repeat  +1 per rule (severity >= 2, not impersonation) that matched two or more
 *           DIFFERENT phrases, e.g. "won a lottery" and "claim your prize".
 *   combo   +1 for reward bait together with a payment/credential/link demand,
 *           +1 for a threat together with a suspicious link.
 *   hidden  +2 when the text contains hidden or full-width characters, a common
 *           way to dodge keyword filters.
 * repeat + combo together are capped at MAX_BONUS so the score stays explainable.
 */
function scoreSignals(signals, { hiddenCharacters = false } = {}) {
  const byRule = new Map();
  const phrasesByRule = new Map();
  for (const signal of signals) {
    const current = byRule.get(signal.ruleId) || 0;
    byRule.set(signal.ruleId, Math.max(current, signal.severity));
    const phrases = phrasesByRule.get(signal.ruleId) || new Set();
    phrases.add(signal.quote.toLowerCase());
    phrasesByRule.set(signal.ruleId, phrases);
  }
  let score = 0;
  let strongChecks = 0;
  for (const severity of byRule.values()) {
    score += severity;
    if (severity >= 3) strongChecks += 1;
  }

  const adjustments = [];
  for (const [ruleId, severity] of byRule.entries()) {
    const tactic = signals.find((x) => x.ruleId === ruleId).tactic;
    if (severity >= 2 && REPEAT_BONUS_TACTICS.has(tactic) && phrasesByRule.get(ruleId).size >= 2) {
      adjustments.push({ kind: 'repeat', points: 1, note: `Several different phrases matched rule ${ruleId}.` });
    }
  }
  const tactics = new Set(signals.map((x) => x.tactic));
  if (tactics.has('reward_bait') && [...REWARD_FOLLOW_UPS].some((t) => tactics.has(t))) {
    adjustments.push({ kind: 'combo', points: 1, note: 'A reward or prize combined with a payment, credential or link request.' });
  }
  if (tactics.has('threat') && tactics.has('suspicious_link')) {
    adjustments.push({ kind: 'combo', points: 1, note: 'A threat combined with a suspicious link.' });
  }
  let bonus = 0;
  const kept = [];
  for (const adj of adjustments) {
    if (bonus + adj.points > MAX_BONUS) break;
    bonus += adj.points;
    kept.push(adj);
  }
  if (hiddenCharacters) {
    bonus += HIDDEN_CHARS_POINTS;
    kept.push({ kind: 'hidden', points: HIDDEN_CHARS_POINTS, note: 'The message contains hidden or full-width characters, often used to dodge filters.' });
  }
  return { score: score + bonus, matchedChecks: byRule.size, strongChecks, adjustments: kept };
}

function pickBand({ score, strongChecks }) {
  if (score >= THRESHOLDS.high || strongChecks >= THRESHOLDS.strongChecksForHigh) return BANDS.high;
  if (score >= THRESHOLDS.medium) return BANDS.medium;
  return BANDS.low;
}

function pickCategory(signals, band) {
  const totals = {};
  const seenRules = new Set();
  for (const signal of signals) {
    if (seenRules.has(signal.ruleId)) continue;
    seenRules.add(signal.ruleId);
    for (const [key, weight] of Object.entries(signal.categories || {})) {
      totals[key] = (totals[key] || 0) + weight;
    }
  }
  // Deterministic order: the order of CATEGORY_LABELS breaks ties.
  const order = Object.keys(CATEGORY_LABELS);
  let best = null;
  for (const key of order) {
    if (key === 'general' || key === 'unclassified') continue;
    const value = totals[key] || 0;
    if (value > 0 && (!best || value > best.value)) best = { key, value };
  }
  if (best && (band.key !== 'low' || best.value >= 3)) return best.key;
  if (band.key !== 'low') return 'general';
  return 'unclassified';
}

function buildUncertainty({ text, links, band, language, hiddenCharacters }) {
  const notes = ['JaalBreak cannot confirm who sent this message.'];
  if (links.length > 0) {
    notes.push('We did not open or verify any link. Its real destination is unknown.');
  }
  if (band.key === 'low') {
    notes.push('Finding few warning signs is not a guarantee that the message is safe.');
  } else {
    notes.push('Matching patterns are warning signs, not proof of fraud.');
  }
  if (language.note) notes.push(language.note);
  if (hiddenCharacters) {
    notes.push('This message contains hidden or full-width characters. Scammers use them to hide words from filters, so treat it with extra care.');
  }
  if (text.trim().length < 40) {
    notes.push('Very short messages give the rules little to work with.');
  }
  return notes;
}

/**
 * Analyse a message.
 * @param {string} rawText  The user's message (pasted or OCR-reviewed).
 * @param {{source?: 'pasted' | 'screenshot' | 'sample'}} options
 */
export function analyzeMessage(rawText, options = {}) {
  const text = normaliseInput(rawText).slice(0, MAX_INPUT_LENGTH);
  if (!text.trim()) {
    throw new Error('Please paste or type a message before analysing.');
  }

  const language = detectLanguage(text);
  const view = buildMatchView(text);
  const hiddenCharacters = HIDDEN_CHARS_RE.test(text) || FULLWIDTH_LETTER_RE.test(text);
  const candidates = [...findRuleCandidates(view), ...findLinkCandidates(view)];
  const resolved = resolveOverlaps(candidates).map((candidate, index) => {
    const tactic = getTactic(candidate.tactic);
    return {
      id: `sig-${index + 1}`,
      ...candidate,
      quote: text.slice(candidate.start, candidate.end),
      tacticLabel: tactic.label,
      tacticShort: tactic.short,
      why: tactic.why,
      doInstead: tactic.doInstead,
    };
  });

  const { verified: signals, discarded } = verifySignals(text, resolved);
  const { score, matchedChecks, strongChecks, adjustments } = scoreSignals(signals, { hiddenCharacters });
  const band = pickBand({ score, strongChecks });
  const categoryKey = pickCategory(signals, band);
  const advice = CATEGORY_ADVICE[categoryKey] || CATEGORY_ADVICE.general;
  const links = extractLinks(view.match).map((link) => assessLink(link.url));
  const tactics = [...new Set(signals.map((s) => s.tactic))];

  return {
    mode: 'rules-only',
    rulesVersion: RULES_VERSION,
    analyzedAt: new Date().toISOString(),
    source: options.source || 'pasted',
    text,
    language,
    signals,
    discardedQuotes: discarded,
    score,
    scoreAdjustments: adjustments,
    hiddenCharacters,
    matchedChecks,
    strongChecks,
    tactics,
    band,
    category: { key: categoryKey, label: CATEGORY_LABELS[categoryKey] },
    advice: { headline: advice.headline, steps: advice.steps },
    universalSteps: UNIVERSAL_STEPS,
    links,
    uncertainty: buildUncertainty({ text, links, band, language, hiddenCharacters }),
  };
}

/** Plain-text summary used by the "Copy summary" button. */
export function buildSummary(result) {
  const lines = [];
  lines.push('JaalBreak analysis (rules-only prototype)');
  lines.push(`Assessment: ${result.band.label}`);
  lines.push(`Category: ${result.category.label}`);
  lines.push(`Matched checks: ${result.matchedChecks} across ${result.tactics.length} tactic(s)`);
  lines.push('');
  if (result.signals.length) {
    lines.push('Evidence found in the message:');
    for (const s of result.signals) {
      lines.push(`- "${s.quote}" — ${s.tacticLabel}`);
    }
  } else {
    lines.push('No warning patterns matched.');
  }
  lines.push('');
  lines.push(`Next step: ${result.advice.headline}`);
  for (const step of result.advice.steps) lines.push(`- ${step}`);
  lines.push('');
  lines.push('Limitations:');
  for (const note of result.uncertainty) lines.push(`- ${note}`);
  lines.push('');
  lines.push('JaalBreak highlights suspicious patterns; it does not prove fraud or safety.');
  return lines.join('\n');
}
