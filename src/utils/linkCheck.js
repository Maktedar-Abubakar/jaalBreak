// ---------------------------------------------------------------------------
// Link extraction and simple, offline link heuristics.
// JaalBreak NEVER opens, fetches or resolves a link. It only reads the text.
// ---------------------------------------------------------------------------

const SHORTENERS = [
  'bit.ly', 'tinyurl.com', 't.ly', 'is.gd', 'cutt.ly', 'rb.gy', 'shorturl.at',
  'goo.gl', 'ow.ly', 'tiny.cc', 'rebrand.ly', 'shorte.st', 'v.gd', 's.id', 't.co',
];

const RISKY_TLDS = [
  'xyz', 'top', 'click', 'live', 'online', 'site', 'icu', 'buzz', 'link', 'vip',
  'cc', 'tk', 'ml', 'ga', 'cf', 'gq', 'work', 'loan', 'win', 'shop', 'support', 'info',
];

const LURE_WORDS = [
  'kyc', 'verify', 'verification', 'update', 'secure', 'login', 'signin', 'account',
  'bank', 'reward', 'refund', 'claim', 'customs', 'parcel', 'redeliver', 'support',
  'bonus', 'prize', 'unblock', 'reactivate',
];

// Brand look-alike check. If a domain label starts with one of these names but the
// host is not one of the brand's official domains, it is flagged
// (e.g. "paytm.com.evil.xyz", "sbi-secure-login.top", "hdfcbank-kyc.com").
// Keep this list short and to official domains you are sure about.
const BRANDS = {
  sbi: ['sbi.co.in', 'onlinesbi.sbi', 'onlinesbi.com', 'sbi.bank.in', 'onlinesbi.sbi.bank.in'],
  hdfc: ['hdfcbank.com', 'hdfc.com', 'hdfcbank.net', 'hdfc.bank.in'],
  icici: ['icicibank.com', 'icici.bank.in'],
  paytm: ['paytm.com'],
  phonepe: ['phonepe.com'],
  npci: ['npci.org.in'],
  uidai: ['uidai.gov.in'],
  irctc: ['irctc.co.in'],
  incometax: ['incometax.gov.in'],
  amazon: ['amazon.in', 'amazon.com', 'amazonaws.com'],
  instagram: ['instagram.com'],
  facebook: ['facebook.com', 'fb.com'],
  whatsapp: ['whatsapp.com', 'whatsapp.net'],
  flipkart: ['flipkart.com'],
  axisbank: ['axisbank.com', 'axis.bank.in'],
  kotak: ['kotak.com', 'kotaksecurities.com', 'kotaklife.com'],
  parivahan: ['parivahan.gov.in'],
};

// Typo look-alikes: official names a scammer misspells by one or two letters
// ("sbii", "hdfcbnak", "paytrn", "lnstagram"). Compared after undoing common
// digit swaps (0->o, 1->l, 3->e, 5->s).
const TYPO_TARGETS = {
  onlinesbi: 'onlinesbi.sbi', hdfcbank: 'hdfcbank.com', icicibank: 'icicibank.com', axisbank: 'axisbank.com',
  paytm: 'paytm.com', phonepe: 'phonepe.com', amazon: 'amazon.in', flipkart: 'flipkart.com',
  instagram: 'instagram.com', facebook: 'facebook.com', whatsapp: 'whatsapp.com', irctc: 'irctc.co.in',
  uidai: 'uidai.gov.in', incometax: 'incometax.gov.in', parivahan: 'parivahan.gov.in', google: 'google.com',
  youtube: 'youtube.com', netflix: 'netflix.com', paypal: 'paypal.com',
};

// Tunnels and throw-away hosts. Banks and government services never send these.
const TUNNEL_HOSTS = ['ngrok.io', 'ngrok-free.app', 'ngrok.app', 'trycloudflare.com', 'loca.lt', 'serveo.net', 'localtunnel.me'];
// Free website builders: fine on their own, suspicious when the address also uses a brand or lure word.
const FREE_HOSTS = ['000webhostapp.com', 'weebly.com', 'wixsite.com', 'blogspot.com', 'web.app', 'firebaseapp.com', 'pages.dev', 'netlify.app', 'vercel.app', 'github.io', 'glitch.me', 'repl.co', 'sites.google.com', 'godaddysites.com', 'webflow.io'];

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 3;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
    }
  }
  return dp[a.length][b.length];
}

export function typoLookalike(host) {
  const labels = host.split('.');
  const unswap = (x) => x.replace(/0/g, 'o').replace(/1/g, 'l').replace(/3/g, 'e').replace(/5/g, 's').replace(/rn/g, 'm');
  for (const raw of labels.flatMap((l) => l.split('-'))) {
    if (raw.length < 4) continue;
    const label = unswap(raw);
    for (const [name, official] of Object.entries(TYPO_TARGETS)) {
      if (isHostOrSubdomainOf(host, official)) continue;
      if (raw === name) continue; // exact names are handled by the brand check
      const limit = name.length >= 8 ? 2 : 1;
      if (label === name || editDistance(label, name) <= limit) return name;
    }
  }
  return null;
}

function isHostOrSubdomainOf(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

function lookalikeBrand(host) {
  const parts = host.split('.').flatMap((label) => label.split('-'));
  for (const [brand, official] of Object.entries(BRANDS)) {
    if (!parts.some((part) => part.startsWith(brand))) continue;
    if (official.some((domain) => isHostOrSubdomainOf(host, domain))) continue;
    return brand;
  }
  return null;
}

const TLD_GROUP = [
  'com', 'in', 'net', 'org', 'co', 'me', 'ly', 'gd', 'io', 'app', 'gov', 'edu',
  'ac', 'ai', ...RISKY_TLDS,
].join('|');

// Matches http(s):// links, www. links and bare domains such as "example.xyz/path".
const URL_RE = new RegExp(
  String.raw`(?:https?:\/\/[^\s<>"'()]+|www\.[^\s<>"'()]+|(?<![@\w.-])(?:[a-z0-9-]+\.)+(?:${TLD_GROUP})(?![a-z0-9-])(?:\/[^\s<>"'()]*)?)`,
  'giu'
);

function trimTrailingPunctuation(value) {
  return value.replace(/[.,;:!?…]+$/u, '');
}

export function getHost(url) {
  const withoutProtocol = url.replace(/^https?:\/\//i, '');
  const host = withoutProtocol.split(/[/?#]/)[0].toLowerCase();
  return host.replace(/:\d+$/, '');
}

export function assessLink(url) {
  const reasons = [];
  const host = getHost(url);
  const labels = host.split('.');
  const tld = labels[labels.length - 1];

  if (SHORTENERS.includes(host)) {
    reasons.push('Uses a link shortener, which hides the real destination.');
  }
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    reasons.push('Points to a raw IP address instead of a named website.');
  }
  if (RISKY_TLDS.includes(tld)) {
    reasons.push(`Uses the domain ending ".${tld}", which official banks and government services in India rarely use.`);
  }
  if (host.startsWith('xn--') || host.includes('.xn--')) {
    reasons.push('Uses an encoded (punycode) domain that can imitate familiar names.');
  }
  const lure = LURE_WORDS.find((word) => host.includes(word));
  if (lure && (host.includes('-') || /\d/.test(host) || RISKY_TLDS.includes(tld))) {
    reasons.push(`The domain contains the word "${lure}", copying official-sounding wording.`);
  }
  const brand = lookalikeBrand(host);
  if (brand) {
    reasons.push(`The domain uses the name "${brand}" but is not one of its official websites.`);
  }
  const typo = typoLookalike(host);
  if (typo && typo !== brand) {
    reasons.push(`The domain looks like "${typo}" but is spelled differently — a typo look-alike of a real website.`);
  }
  if (TUNNEL_HOSTS.some((d) => isHostOrSubdomainOf(host, d))) {
    reasons.push('The link runs through a temporary tunnel service (like ngrok). Banks and government services never use these.');
  }
  if (FREE_HOSTS.some((d) => isHostOrSubdomainOf(host, d)) && (brand || typo || lure)) {
    reasons.push('A free website builder is being used with an official-sounding name. Real banks and brands use their own domain.');
  }
  // "xn--" is the punycode marker, not a real hyphenated name, so do not count it.
  if ((host.replace(/xn--/g, '').match(/-/g) || []).length >= 2) {
    reasons.push('The domain contains several hyphens, a common trait of look-alike sites.');
  }
  if (/^http:\/\//i.test(url)) {
    reasons.push('Uses an unencrypted http:// address.');
  }

  return { url, host, suspicious: reasons.length > 0, reasons };
}

export function extractLinks(text) {
  const found = [];
  for (const match of text.matchAll(URL_RE)) {
    const raw = trimTrailingPunctuation(match[0]);
    if (!raw || raw.length < 4) continue;
    // Skip things that look like decimal numbers or amounts ("2.5", "Rs.500").
    if (/^[\d.,]+$/.test(raw)) continue;
    found.push({ start: match.index, end: match.index + raw.length, url: raw });
  }
  return found;
}
