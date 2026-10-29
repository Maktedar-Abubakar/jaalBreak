// ---------------------------------------------------------------------------
// Email checks: reads the From / Reply-To lines if the user pasted them, and
// compares the sender's name with the sender's real address.
// ---------------------------------------------------------------------------
import { assessLink } from './linkCheck.js';

const FREE_MAIL = ['gmail.com', 'yahoo.com', 'yahoo.co.in', 'outlook.com', 'hotmail.com', 'rediffmail.com', 'proton.me', 'protonmail.com', 'icloud.com', 'aol.com', 'zoho.com', 'mail.com', 'gmx.com'];
const BRAND_WORDS = ['sbi', 'state bank', 'hdfc', 'icici', 'axis', 'kotak', 'paytm', 'phonepe', 'google pay', 'amazon', 'flipkart', 'instagram', 'facebook', 'meta', 'whatsapp', 'income tax', 'irctc', 'uidai', 'aadhaar', 'rbi', 'reserve bank', 'police', 'customs', 'netflix', 'microsoft', 'apple', 'infosys', 'tcs', 'wipro', 'accenture', 'deloitte'];
const ADDR = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/;

function headerLine(text, name) {
  const m = String(text).match(new RegExp(`^\\s*${name}\\s*:\\s*(.+)$`, 'im'));
  return m ? m[1].trim() : '';
}

function parseSender(line) {
  if (!line) return null;
  const address = (line.match(ADDR) || [''])[0].toLowerCase();
  if (!address) return null;
  const displayName = line.replace(/<[^>]*>/, '').replace(address, '').replace(/["']/g, '').trim();
  return { displayName, address, domain: address.split('@')[1] };
}

export function looksLikeEmail(text) {
  return /^\s*(?:from|reply-to|subject)\s*:/im.test(String(text));
}

export function assessEmail(text) {
  const from = parseSender(headerLine(text, 'from'));
  if (!from) return null;
  const replyTo = parseSender(headerLine(text, 'reply-to'));
  const reasons = [];
  const named = BRAND_WORDS.find((b) => `${from.displayName} ${headerLine(text, 'subject')}`.toLowerCase().includes(b));
  if (named && FREE_MAIL.includes(from.domain)) {
    reasons.push(`It claims to be from "${named}" but was sent from a free ${from.domain} address. Real companies email from their own domain.`);
  }
  if (named && !FREE_MAIL.includes(from.domain) && !from.domain.replace(/[^a-z]/g, '').includes(named.replace(/[^a-z]/g, ''))) {
    reasons.push(`The name says "${named}" but the address is @${from.domain}, which does not contain that name.`);
  }
  const link = assessLink(`http://${from.domain}`);
  for (const r of link.reasons) if (!/unencrypted/.test(r)) reasons.push(`Sender domain: ${r}`);
  if (replyTo && replyTo.address !== from.address && replyTo.domain !== from.domain) {
    reasons.push(`Replies go to a different address (${replyTo.address}) than the sender. This is common in invoice and job scams.`);
  }
  if (/\.(?:html?|exe|scr|apk|js|vbs|iso|img|zip|rar|7z)\b/i.test(text) && /attach/i.test(text)) {
    reasons.push('It mentions an attachment type that can run code (.html, .exe, .apk, .zip…). Do not open it.');
  }
  return { from, replyTo, reasons, suspicious: reasons.length > 0 };
}
