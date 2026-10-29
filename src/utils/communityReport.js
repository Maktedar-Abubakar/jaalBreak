// What a community report contains. Pure function so it can be tested.
export const CHANNELS = [
  ['whatsapp', 'WhatsApp'],
  ['sms', 'SMS'],
  ['instagram', 'Instagram'],
  ['facebook', 'Facebook'],
  ['telegram', 'Telegram'],
  ['email', 'Email'],
  ['call', 'Phone call'],
  ['other', 'Somewhere else'],
];


/** Exactly what gets sent. Shown to the user before they press Share. */
export function buildCommunityReport(result, channel) {
  return {
    category: result.category.key,
    band: result.band.key,
    tactics: [...new Set(result.signals.map((s) => s.tactic))].slice(0, 20),
    channel: CHANNELS.some(([k]) => k === channel) ? channel : 'other',
    language: String(result.language.label || '').slice(0, 40),
    rules_version: String(result.rulesVersion || '').slice(0, 20),
  };
}

