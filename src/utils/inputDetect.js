// Works out what the user pasted, so the smart box can show the right checks.
import { extractLinks } from './linkCheck.js';
import { extractUpiIds, parseUpiUri } from './upiCheck.js';
import { looksLikeEmail } from './emailCheck.js';

export const INPUT_KINDS = {
  message: 'Message',
  link: 'Link only',
  upi: 'UPI ID',
  'upi-qr': 'UPI payment QR',
  email: 'Email',
};

export function detectInputKind(text) {
  const t = String(text || '').trim();
  if (!t) return 'message';
  if (parseUpiUri(t)) return 'upi-qr';
  if (looksLikeEmail(t)) return 'email';
  const words = t.split(/\s+/);
  if (words.length <= 2) {
    const links = extractLinks(t);
    if (links.length === 1 && links[0].url.length >= t.replace(/\s+/g, '').length - 2) return 'link';
    const upi = extractUpiIds(t);
    if (upi.length === 1 && upi[0].length >= t.length - 2) return 'upi';
  }
  return 'message';
}
