// ---------------------------------------------------------------------------
// UPI ID and UPI QR checks. Offline: JaalBreak cannot look up who owns a UPI
// ID (there is no public database), so it only reads what the ID itself shows.
// ---------------------------------------------------------------------------

// Common UPI handles (the part after @). Not a complete list.
const KNOWN_HANDLES = [
  'ybl', 'ibl', 'axl', 'paytm', 'ptyes', 'ptaxis', 'pthdfc', 'ptsbi', 'okaxis', 'okhdfcbank', 'okicici', 'oksbi',
  'upi', 'apl', 'yapl', 'rapl', 'jupiteraxis', 'fam', 'freecharge', 'axisbank', 'icici', 'hdfcbank', 'sbi', 'kotak',
  'kmbl', 'pnb', 'barodampay', 'boi', 'cnrb', 'unionbank', 'idfcbank', 'indus', 'yesbank', 'airtel', 'jio', 'naviaxis',
  'waaxis', 'wahdfcbank', 'waicici', 'wasbi', 'superyes', 'slice', 'dbs', 'federal', 'aubank', 'rbl', 'idbi', 'mahb',
];

// Words that suggest the ID is pretending to be a bank, government office or support desk.
const LURE_NAMES = ['refund', 'kyc', 'support', 'care', 'helpdesk', 'help', 'rbi', 'govt', 'gov', 'cashback', 'reward', 'lottery', 'prize', 'police', 'customs', 'electricity', 'bill', 'verify', 'official', 'bank', 'sbi', 'hdfc', 'icici', 'irctc', 'income', 'tax', 'court', 'cyber'];

export const UPI_ID_RE = /\b[a-z0-9][a-z0-9._-]{1,48}@[a-z]{2,20}\b(?![.\w-])/giu;

export function extractUpiIds(text) {
  const seen = new Set();
  const out = [];
  for (const m of String(text).matchAll(UPI_ID_RE)) {
    const id = m[0].toLowerCase();
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export function assessUpi(id) {
  const [name, handle] = id.toLowerCase().split('@');
  const reasons = [];
  if (!KNOWN_HANDLES.includes(handle)) {
    reasons.push(`"@${handle}" is not one of the common UPI handles. Check it in your UPI app before paying.`);
  }
  const lure = LURE_NAMES.find((w) => name.includes(w));
  if (lure) {
    reasons.push(`The name part uses "${lure}". Banks, government offices and support desks never ask you to pay a personal UPI ID.`);
  }
  if (/^\d{10}$/.test(name)) {
    reasons.push('It is a mobile number. Paying it sends money to a person, not to a company or office.');
  }
  return { id, name, handle, suspicious: Boolean(lure) || !KNOWN_HANDLES.includes(handle), reasons };
}

// upi://pay?pa=someone@ybl&pn=Name&am=499&tn=note
export function parseUpiUri(text) {
  const t = String(text).trim();
  if (!/^upi:\/\/(?:pay|collect)/i.test(t)) return null;
  let params;
  try {
    params = new URLSearchParams(t.slice(t.indexOf('?') + 1));
  } catch {
    return null;
  }
  return {
    payee: (params.get('pa') || '').toLowerCase(),
    name: params.get('pn') || '',
    amount: params.get('am') || '',
    note: params.get('tn') || '',
  };
}

// Turns a decoded QR into readable text for the rules and the user.
export function qrToText(payload) {
  const upi = parseUpiUri(payload);
  if (!upi) return payload;
  const amount = upi.amount ? `₹${upi.amount}` : 'an amount you type';
  return `UPI payment QR code. Scanning it and entering your PIN pays ${amount} to ${upi.payee}${upi.name ? ` (name shown: ${upi.name})` : ''}.${upi.note ? ` Note in the QR: ${upi.note}` : ''}`;
}

