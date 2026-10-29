// ---------------------------------------------------------------------------
// Official reporting resources (India).
// Hard-coded on purpose so they work without any API.
// Review these links on build/demo day and update `lastReviewed`.
// JaalBreak never files complaints itself and cannot recover money.
// ---------------------------------------------------------------------------

export const RESOURCES_LAST_REVIEWED = '19 October 2026';

export const OFFICIAL_RESOURCES = [
  {
    id: 'chakshu',
    name: 'Chakshu — Sanchar Saathi',
    owner: 'Department of Telecommunications, Government of India',
    when: 'Report a suspected fraud call, SMS or WhatsApp message when no money has been lost.',
    url: 'https://sancharsaathi.gov.in/sfc/',
    display: 'sancharsaathi.gov.in/sfc',
    kind: 'link',
  },
  {
    id: 'helpline-1930',
    name: 'National Cyber Crime Helpline — 1930',
    owner: 'Indian Cyber Crime Coordination Centre (I4C)',
    when: 'Call promptly if money has already been lost. Speed matters for stopping transfers.',
    url: 'tel:1930',
    display: 'Call 1930',
    kind: 'phone',
  },
  {
    id: 'cybercrime-portal',
    name: 'National Cyber Crime Reporting Portal',
    owner: 'Ministry of Home Affairs, Government of India',
    when: 'File a formal complaint about financial fraud or other cybercrime.',
    url: 'https://cybercrime.gov.in',
    display: 'cybercrime.gov.in',
    kind: 'link',
  },
];

export const TRUST_STATEMENT =
  'JaalBreak highlights suspicious patterns; it does not prove fraud or safety. Never share an OTP, PIN, password, or CVV with anyone. Verify through an independent official channel.';
