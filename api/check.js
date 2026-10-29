// ---------------------------------------------------------------------------
// JaalBreak public API (Vercel serverless function) — for other apps, bots and
// partners (banks, college portals) to use the same rules.
//
//   POST /api/check      body: {"text": "message to check"}
//   GET  /api/check      shows usage
//
// Privacy: the text is checked in memory and NOT stored or logged.
// Returns the same verdict as the website (rules version included).
// ---------------------------------------------------------------------------
import { analyzeMessage, MAX_INPUT_LENGTH, RULES_VERSION } from '../src/utils/analyzer.js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

export function toApiResult(r) {
  return {
    rulesVersion: r.rulesVersion,
    risk: { level: r.band.key, label: r.band.label },
    score: r.score,
    category: { key: r.category.key, label: r.category.label },
    language: r.language.label,
    signals: r.signals.map((s) => ({ rule: s.ruleId, tactic: s.tactic, tacticLabel: s.tacticLabel, quote: s.quote, start: s.start, end: s.end, weight: s.severity })),
    links: (r.links || []).map((l) => ({ host: l.host, suspicious: l.suspicious, reasons: l.reasons })),
    advice: { headline: r.advice.headline, steps: r.advice.steps },
    notes: r.uncertainty,
    disclaimer: 'Rule-based warning signs, not proof of fraud or safety.',
  };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') {
    return res.status(200).json({
      name: 'JaalBreak check API',
      rulesVersion: RULES_VERSION,
      usage: 'POST /api/check with JSON {"text": "..."} (max 5000 characters). Nothing is stored.',
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Body must be JSON: {"text": "..."}' });
    }
  }
  const text = body && typeof body.text === 'string' ? body.text : '';
  if (!text.trim()) return res.status(400).json({ error: 'Send {"text": "..."} with the message to check.' });
  if (text.length > MAX_INPUT_LENGTH) return res.status(413).json({ error: `Text is longer than ${MAX_INPUT_LENGTH} characters.` });
  return res.status(200).json(toApiResult(analyzeMessage(text)));
}
