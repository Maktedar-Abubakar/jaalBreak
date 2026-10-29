// ---------------------------------------------------------------------------
// Extended JaalBreak tests — run with:  node --test src/utils/extra.test.js
// Tests named "fixed: ..." were KNOWN GAPS (found in the first test report) and are
// now regression tests: they must keep passing.
// ---------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessage, buildSummary, detectLanguage, MAX_INPUT_LENGTH } from './analyzer.js';
import { RULES } from '../data/rules.js';
import { extractLinks, assessLink, getHost } from './linkCheck.js';
import * as A from './authValidation.js';
import { recordToRow, rowToRecord } from './historyMapping.js';
import * as S from './storage.js';
import { buildIncidentReport, EMPTY_REPORT_FIELDS, NOT_PROVIDED } from './reportBuilder.js';
import { buildLearningSummary, validateScenario } from './scenarioEngine.js';
import { SCENARIOS } from '../data/scenarios/index.js';

const run = (text) => analyzeMessage(text);
const quotes = (r) => r.signals.map((s) => s.quote);
const ruleIds = (r) => r.signals.map((s) => s.ruleId);

// ============================================================ 1. ANALYZER

const DETECTION = [
  // [name, input, expected band, expected category, quotes that must appear]
  ['OTP request', 'Share your OTP to complete the transaction.', 'medium', 'bank_kyc', ['Share your OTP']],
  ['PIN request', 'Please enter your pin', 'medium', 'bank_kyc', ['enter your pin']],
  ['digital arrest + secrecy', 'This is the cyber cell. A digital arrest warrant is issued. Do not tell anyone.', 'high', 'authority_threat', ['cyber cell', 'digital arrest', 'Do not tell anyone']],
  ['remote-access app', 'Install AnyDesk so our agent can help fix your refund.', 'medium', 'tech_support', ['AnyDesk']],
  ['scan QR to "receive"', 'Scan this QR to receive Rs 500 cashback.', 'medium', 'prize_reward', ['Scan this QR to receive']],
  ['Hinglish block + OTP', 'Aapka account band ho jayega. Turant OTP bhejo.', 'high', 'bank_kyc', ['account band ho jayega', 'Turant', 'OTP bhejo']],
  ['Hinglish fee', 'Registration fees bharo aaj hi', 'medium', 'job_fee', ['Registration fees bharo', 'aaj hi']],
  ['ALL CAPS still matches', 'SHARE YOUR OTP IMMEDIATELY', 'medium', 'bank_kyc', ['SHARE YOUR OTP', 'IMMEDIATELY']],
  ['CRLF line endings', 'Pay ₹500 registration fee\r\ntoday or your slot will be cancelled', 'high', 'job_fee', ['Pay ₹500 registration fee', 'today or your slot will be cancelled']],
  ['mixed Hindi + English', 'Dear Customer, आपका खाता आज रात बंद हो जाएगा. Update your KYC immediately.', 'high', 'bank_kyc', ['खाता आज रात बंद हो जाएगा', 'Update your KYC']],
  ['two medium rules reach medium', 'Dear Customer, your account will be blocked. Update your KYC.', 'medium', 'bank_kyc', ['account will be blocked', 'Update your KYC']],
  ['emoji + urgency only', '🚨🚨 URGENT 🚨🚨 act now!!!', 'low', 'unclassified', ['URGENT', 'act now']],
  ['injection-style text', "'; DROP TABLE scan_history; -- <script>alert(1)</script> share your otp", 'medium', 'bank_kyc', ['share your otp']],
];

for (const [name, input, band, category, mustQuote] of DETECTION) {
  test(`analyzer: ${name}`, () => {
    const r = run(input);
    assert.equal(r.band.key, band, `band for: ${quotes(r).join(' | ')}`);
    assert.equal(r.category.key, category);
    for (const q of mustQuote) assert.ok(quotes(r).includes(q), `missing "${q}" in ${quotes(r).join(' | ')}`);
    for (const s of r.signals) assert.equal(r.text.slice(s.start, s.end), s.quote);
  });
}

const SAFE = [
  ['plain chat', 'Hey, are we still meeting for lunch tomorrow at 1?'],
  ['real OTP notice', 'Your OTP is 482913. Do not share it with anyone. - Meridian Bank'],
  ['"never ask" negation', 'We will never ask you to share your OTP.'],
  ['"do not share" negation', 'Do not share your OTP with anyone.'],
  ['one word', 'Hi'],
];
for (const [name, input] of SAFE) {
  test(`analyzer (no false alarm): ${name}`, () => {
    const r = run(input);
    assert.equal(r.band.key, 'low');
    assert.equal(r.category.key, 'unclassified');
    assert.equal(r.signals.length, 0);
  });
}

test('negation only reaches back within the same sentence', () => {
  const r = run('Never ever, under any circumstances at all in the world, share. Please share your OTP now.');
  assert.equal(r.band.key, 'medium');
  assert.deepEqual(quotes(r), ['share your OTP']);
});

test('weak signal alone: police mention is flagged but stays low', () => {
  const r = run('I called the police about the noise.');
  assert.equal(r.band.key, 'low');
  assert.deepEqual(ruleIds(r), ['IMP-01']);
});

test('input guards: empty, whitespace, null and undefined all throw', () => {
  for (const bad of ['', '   ', '\n\t', null, undefined]) assert.throws(() => run(bad), /paste or type/);
});

test('input is truncated to MAX_INPUT_LENGTH', () => {
  assert.equal(run('a '.repeat(4000)).text.length, MAX_INPUT_LENGTH);
});

test('unsupported language: flagged, noted, never claimed safe', () => {
  const r = run('మీ ఖాతా బ్లాక్ చేయబడుతుంది');
  assert.equal(r.language.supported, false);
  assert.ok(r.uncertainty.some((n) => n.includes('English, Hindi, Hinglish and Kannada')));
});

test('uncertainty notes: short message, link present, low band', () => {
  const short = run('Hi');
  assert.ok(short.uncertainty.some((n) => n.includes('Very short')));
  assert.ok(short.uncertainty.some((n) => n.includes('not a guarantee')));
  const withLink = run('Please check https://example.xyz now for details of your order today.');
  assert.ok(withLink.uncertainty.some((n) => n.includes('did not open or verify any link')));
});

test('language detection', () => {
  const cases = [['hello', 'en'], ['नमस्ते दुनिया', 'hi'], ['नमस्ते hello world', 'mixed'], ['ಕನ್ನಡ', 'kn'], ['తెలుగు', 'other'], ['12345', 'en'], ['', 'en']];
  for (const [text, code] of cases) assert.equal(detectLanguage(text).code, code, text);
});

test('buildSummary: no-match message states limits and never guarantees safety', () => {
  const out = buildSummary(run('hello friend, lunch?'));
  assert.ok(out.includes('No warning patterns matched.'));
  assert.ok(out.includes('does not prove fraud or safety'));
  assert.ok(out.includes('not a guarantee'));
});

// ---- one positive example per rule -----------------------------
const RULE_EXAMPLES = {
  'URG-01': 'Reply today or your slot will be cancelled',
  'URG-02': 'Act now, this is your last chance.',
  'URG-03': 'Only 5 seats left for the batch.',
  'URG-HI': 'तुरंत जवाब दें',
  'URG-HG': 'Jaldi karo warna der ho jayegi',
  'THR-01': 'Your SIM will be blocked.',
  'THR-03': 'Your gas connection will be disconnected.',
  'THR-02': 'Legal action will be initiated against you.',
  'THR-HI': 'आपका खाता बंद हो जाएगा',
  'THR-HG': 'Aapka account band ho jayega',
  'FEE-01': 'Pay ₹500 registration fee',
  'FEE-02': 'Customs fee of Rs.49 is due',
  'FEE-HI': 'रजिस्ट्रेशन फीस जमा करें',
  'FEE-HG': 'Registration fees bharo',
  'CRD-01': 'Send your CVV',
  'CRD-HI': 'अपना OTP भेजें',
  'CRD-HG': 'OTP bhejo',
  'PRT-01': 'Update your KYC',
  'PRT-HI': 'केवाईसी अपडेट करें',
  'IMP-01': 'This is the Reserve Bank of India',
  'IMP-02': 'This is my new number',
  'IMP-HI': 'पापा मैं बोल रहा हूँ',
  'CHN-01': 'Contact us on Telegram only',
  'RWD-01': 'You have won a lottery',
  'RWD-02': 'You have been shortlisted',
  'RWD-HI': 'आपने जीता है',
  'SEC-01': 'Keep this confidential',
  'SEC-HI': 'किसी को मत बताना',
  'EMO-01': "I'm in trouble",
  'EMO-02': 'Send the money urgently',
  'EMO-HI': 'पैसे भेजो',
  'RMT-01': 'Install AnyDesk',
  'PAY-01': 'Scan this QR to receive money',
  'PAY-02': 'Please pay to this UPI ID',
  'PAY-03': 'Buy Google Play cards',
  'OFR-01': 'Earn ₹5000 per day',
  'OFR-02': 'Guaranteed returns',
  'FEE-03': 'The processing fee applies',
  'CRD-02': 'Please send me the code you just received by SMS',
  'CRD-03': 'Your card details are required to complete the refund.',
  'EXT-01': 'I have recorded your video.',
  'GEN-01': 'Dear Customer',
  'GEN-HI': 'प्रिय ग्राहक',
  // v1.2 rules — examples taken from real reported scam messages
  'THR-04': 'Dear customer your SBI bank account have be suspend today',
  'PRT-02': 'Dear A/c Holder your SBI Bank Documents have expire',
  'CALL-01': 'Please call customer care XXXXXXXXXX immediately',
  'RWD-03': 'Your SBI Card points worth INR 4500 expire by today. Kindly redeem your points in cash by click here',
  'RWD-04': 'Dear sir you win 1st prize from Flipkart online shopping lucky draw',
  'REF-01': 'You have a refund of Rs 2,450 for your card, please confirm your detail to activate your refund http://bit.do/ebuVY',
  'LOAN-01': 'Your Loan Amount for Rs 50,000 Is Successfully Approved Check Your Loan Status Here',
  'UTL-01': 'Dear consumer your electricity disconnect tonight at 9:30 pm',
  'UTL-02': 'Your previous month bill was not update',
  'AUTH-01': 'A parcel in your name containing drugs and fake passports has been seized',
  'AUTH-HG': 'Delhi Police se bol raha hoon',
  'THR-HG2': 'Aapke Aadhaar se linked account par complaint mili hai',
  'CHL-01': 'Your traffic e-challan of Rs 500 is pending, pay now',
  'APK-01': 'Download RTO-Challan.apk to see your fine',
  'TSK-01': 'Like YouTube videos and earn Rs 3000 daily',
  'TSK-02': 'Part time job, work from home, daily salary',
  'CHN-02': 'Contact HR on wa.me/919876543210',
  'INV-01': 'Bhoruka Alum circuits left, buy strongly',
  'ADV-01': 'I want to transfer my fund 5.5m USD to you',
  'ACC-01': 'We noticed unusual activity on your account',
  'ATO-01': 'Your post violates copyright law. Submit an appeal here or your account will be deleted within 24 hours',
  'ATO-02': 'This is the Instagram Copyright Help Center',
  'ATO-03': 'Please send me a screenshot of the message you just got',
  'ATO-04': 'Get a free blue tick for your page',
  'ATO-05': 'Paid promotion offer: download our app and log in with your Instagram',
  // Kannada (beta)
  'URG-KN': 'ತಕ್ಷಣ ಕರೆ ಮಾಡಿ',
  'THR-KN': 'ನಿಮ್ಮ ಖಾತೆ ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ',
  'PRT-KN': 'ನಿಮ್ಮ KYC ಅಪ್ಡೇಟ್ ಮಾಡಿ',
  'CRD-KN': 'ನಿಮ್ಮ OTP ಹಂಚಿಕೊಳ್ಳಿ',
  'FEE-KN': 'ನೋಂದಣಿ ಶುಲ್ಕ ಪಾವತಿಸಿ',
  'RWD-KN': 'ನೀವು ಗೆದ್ದಿದ್ದೀರಿ',
  'UTL-KN': 'ಇಂದು ರಾತ್ರಿ ನಿಮ್ಮ ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತ ಮಾಡಲಾಗುವುದು',
  'AUTH-KN': 'ನಾನು ಸೈಬರ್ ಕ್ರೈಮ್ ಪೊಲೀಸ್ ಠಾಣೆಯಿಂದ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ',
  'SEC-KN': 'ಇದನ್ನು ಯಾರಿಗೂ ಹೇಳಬೇಡಿ',
  'GEN-KN': 'ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ',
  'CRD-KG': 'Nimma OTP heli',
  'THR-KG': 'Nimma account block aagutte',
  'AUTH-KG': 'Cyber crime police station inda maatadtiddini',
  'PRT-KG': 'Nimma KYC update maadi',
  'UPI-01': 'Pay Rs 10 to sbi.refund@ybl to receive your refund',
  'JOB-01': 'Please pay the laptop charges of Rs 4,999 before joining',
  'JOB-02': 'Send your documents to hr.infosys.recruitment@gmail.com',
  'BEC-01': 'Please note our bank details have changed. Pay this invoice to our new account.',
};

test('rule coverage: every rule in rules.js has an example in this file', () => {
  const missing = RULES.map((r) => r.id).filter((id) => !RULE_EXAMPLES[id]);
  assert.deepEqual(missing, []);
});

for (const [id, example] of Object.entries(RULE_EXAMPLES)) {
  test(`rule ${id} fires on: ${example}`, () => {
    assert.ok(ruleIds(run(example)).includes(id), `got ${ruleIds(run(example)).join(',') || 'nothing'}`);
  });
}

// ---- FORMER GAPS, now fixed (regression tests) -----------------------------
test('fixed: Hindi "never share OTP" warning should NOT be flagged', () => {
  assert.equal(run('OTP कभी किसी को न बताएं').band.key, 'low');
});
test('fixed: blatant lottery message should reach at least medium', () => {
  assert.notEqual(run('You have won a lottery of Rs.5,00,000. Claim your prize now.').band.key, 'low');
});
test('fixed: "guaranteed returns / earn per day" scheme should reach at least medium', () => {
  assert.notEqual(run('Earn ₹5000 per day by liking videos. Guaranteed returns, double your money!').band.key, 'low');
});
test('fixed: gift-card payment demand should reach at least medium', () => {
  assert.notEqual(run('Buy Google Play cards and send the codes.').band.key, 'low');
});
test('fixed: zero-width characters must not hide an OTP request', () => {
  assert.ok(ruleIds(run('Sh\u200bare your O\u200bTP')).includes('CRD-01'));
});
test('fixed: full-width letters must not hide an OTP request', () => {
  assert.ok(ruleIds(run('Ｓｈａｒｅ ｙｏｕｒ ＯＴＰ')).includes('CRD-01'));
});

test('fixed: "Nobody from the bank will ask you to share your OTP." should NOT be flagged', () => {
  assert.equal(run('Nobody from the bank will ask you to share your OTP.').band.key, 'low');
});
test('fixed: an earlier "never" must not hide a real ask in the same sentence', () => {
  assert.notEqual(run('We never call you, but share your OTP now').band.key, 'low');
});
test('fixed: a line break inside a phrase must not defeat the rule (SMS wrap / OCR output)', () => {
  assert.ok(ruleIds(run('Share your\nOTP now')).includes('CRD-01'));
});
test('fixed: spaced letters "O T P" should be caught', () => {
  assert.ok(ruleIds(run('Please share your O T P with us')).includes('CRD-01'));
});
test('fixed: leetspeak "0TP" should be caught', () => {
  assert.ok(ruleIds(run('Share your 0TP now')).includes('CRD-01'));
});
test('fixed: a plain "processing fee" in an info message should not be medium', () => {
  assert.equal(run('The bank charges a processing fee of 1% on personal loans.').band.key, 'low');
});
test('fixed: "send me the code you just received" (OTP phrased without the word OTP)', () => {
  assert.notEqual(run('Please send me the code you just received by SMS').band.key, 'low');
});
test('fixed: passive card-details request', () => {
  assert.notEqual(run('Your card details are required to complete the refund.').band.key, 'low');
});
test('fixed: "invest X get 2X back" doubler scheme', () => {
  assert.notEqual(run('Invest 10000 get 20000 back in 24 hours, 100% safe.').band.key, 'low');
});
test('fixed: sextortion / blackmail message', () => {
  assert.notEqual(run('I have recorded your video. Pay Rs 20000 or I will leak it to all your contacts.').band.key, 'low');
});

// ============================================================ 2. LINKS

const LINK_CASES = [
  // [input, extracted urls, suspicious?]
  ['http://meridian-kyc-verify.xyz/update', ['http://meridian-kyc-verify.xyz/update'], true],
  ['https://bit.ly/3abc', ['https://bit.ly/3abc'], true],
  ['https://t.co/abc', ['https://t.co/abc'], true],
  ['http://192.168.1.5/login', ['http://192.168.1.5/login'], true],
  ['https://www.google.com', ['https://www.google.com'], false],
  ['https://sbi.co.in/web', ['https://sbi.co.in/web'], false],
  ['https://bank.com:8080/x', ['https://bank.com:8080/x'], false],
  ['https://sub.domain.example.org/a?b=c#d', ['https://sub.domain.example.org/a?b=c#d'], false],
  ['www.sbi-secure-login.top', ['www.sbi-secure-login.top'], true],
  ['example.xyz/path', ['example.xyz/path'], true],
  ['https://paytm.com.evil.xyz', ['https://paytm.com.evil.xyz'], true],
  ['https://xn--pple-43d.com', ['https://xn--pple-43d.com'], true],
  ['http://example.com', ['http://example.com'], true], // http:// alone is a reason
  ['HTTP://EVIL.TOP', ['HTTP://EVIL.TOP'], true], // case-insensitive
  ['visit https://hdfcbank.com.', ['https://hdfcbank.com'], false], // trailing dot trimmed
  ['https://bit.ly.', ['https://bit.ly'], true],
  ['check.my-site.in now', ['check.my-site.in'], false],
  // things that must NOT be treated as links
  ['Rs.500', [], null],
  ['2.5', [], null],
  ['user@example.com', [], null],
  ['file.txt', [], null],
  ['v1.2.3', [], null],
];
for (const [input, urls, suspicious] of LINK_CASES) {
  test(`links: ${JSON.stringify(input)}`, () => {
    const found = extractLinks(input);
    assert.deepEqual(found.map((l) => l.url), urls);
    if (suspicious !== null) assert.equal(assessLink(found[0].url).suspicious, suspicious);
  });
}

test('links: getHost strips protocol, path, port and lowercases', () => {
  assert.equal(getHost('HTTPS://Bank.COM:8080/x?y=1#z'), 'bank.com');
});

test('links: suspicious link adds a LNK-02 (severity 3) signal, clean link only LNK-01', () => {
  const bad = run('Open http://meridian-kyc-verify.xyz/update to continue with your order.');
  assert.ok(ruleIds(bad).includes('LNK-02'));
  const ok = run('Your receipt is at https://www.google.com for your records, thanks.');
  assert.ok(ruleIds(ok).includes('LNK-01'));
  assert.ok(!ruleIds(ok).includes('LNK-02'));
});

// ============================================================ 3. AUTH VALIDATION

const EMAIL_VALID = ['a@b.co', 'user+tag@example.com', '  name@example.com  ', 'a@b.c.co', 'ÜSER@exämple.com'];
const EMAIL_INVALID = ['a@b.c', 'a@@b.com', 'a b@c.com', 'a@.com', '@b.com', 'x'.repeat(250) + '@a.com', 'a@b.c.d', 'a@-b.com', 'a@b-.com', 'a@b_c.com', 'a.@b.com', 'a@b..com', 'name@example.com.', '.@b.com', 'x'.repeat(65) + '@b.com'];
for (const e of EMAIL_VALID) test(`email valid: ${JSON.stringify(e)}`, () => assert.equal(A.validateEmail(e), ''));
for (const e of EMAIL_INVALID) test(`email invalid: ${JSON.stringify(e.slice(0, 20))}`, () => assert.match(A.validateEmail(e), /valid email/));
test('email empty / whitespace', () => {
  assert.match(A.validateEmail(''), /Enter your email/);
  assert.match(A.validateEmail('   '), /Enter your email/);
});
test('fixed: email with consecutive dots should be rejected', () => {
  assert.match(A.validateEmail('a@b..com'), /valid email/);
});
test('fixed: email ending in a dot should be rejected', () => {
  assert.match(A.validateEmail('name@example.com.'), /valid email/);
});
test('fixed: local part ".", e.g. ".@b.com", should be rejected', () => {
  assert.match(A.validateEmail('.@b.com'), /valid email/);
});

test('password rules', () => {
  const ok = ['abcd1234', 'Abcd 1234', 'aaaaaaaa1', 'a'.repeat(1000) + '1', 12345678 + 'a'];
  for (const p of ok) assert.equal(A.validatePassword(p), '', String(p).slice(0, 12));
  assert.match(A.validatePassword(''), /Enter a password/);
  assert.match(A.validatePassword(null), /Enter a password/);
  assert.equal(A.validatePassword('abc1'), 'Password needs at least 8 characters.');
  assert.equal(A.validatePassword('abcdefgh'), 'Password needs a number.');
  assert.equal(A.validatePassword('12345678'), 'Password needs a letter.');
  assert.deepEqual(A.passwordProblems('abc'), ['at least 8 characters', 'a number']);
  assert.deepEqual(A.passwordProblems(''), ['at least 8 characters', 'a letter', 'a number']);
  // letters from any script count
  assert.equal(A.validatePassword('パスワード1234'), '');
  assert.equal(A.validatePassword('पासवर्ड1234'), '');
  assert.equal(A.validatePassword('!!!!!!!!11'), 'Password needs a letter.');
});

test('name rules: boundary at 100, trimmed, unicode ok', () => {
  assert.match(A.validateName(''), /Enter your full name/);
  assert.match(A.validateName('   '), /Enter your full name/);
  assert.equal(A.validateName('A'), '');
  assert.equal(A.validateName('x'.repeat(100)), '');
  assert.equal(A.validateName('  ' + 'x'.repeat(100) + '  '), '');
  assert.equal(A.validateName('x'.repeat(101)), 'Name must be 100 characters or fewer.');
  assert.equal(A.validateName('राहुल शर्मा'), '');
});

test('confirm password rules (case-sensitive)', () => {
  assert.equal(A.validateConfirm('a1b2c3d4', ''), 'Re-enter your password.');
  assert.equal(A.validateConfirm('a1b2c3d4', 'a1b2c3d4'), '');
  assert.equal(A.validateConfirm('a1b2c3d4', 'A1b2c3d4'), 'Passwords do not match.');
});

test('form-level validators', () => {
  assert.deepEqual(A.validateLogin({}), { email: 'Enter your email address.', password: 'Enter your password.' });
  assert.deepEqual(A.validateLogin({ email: 'a@b.com', password: ' ' }), {}); // a space counts as a password
  assert.deepEqual(A.validateSignup({ fullName: 'A', email: 'a@b.com', password: 'abcdefg1', confirm: 'abcdefg1' }), {});
  assert.deepEqual(A.validateNewPassword({ password: 'abc', confirm: 'abc' }), { password: 'Password needs at least 8 characters, a number.' });
});

const ERROR_CASES = [
  [{ code: 'invalid_credentials' }, /don’t match/],
  [{ error_code: 'email_exists' }, /already exists/],
  [{ code: 'over_email_send_rate_limit' }, /Too many emails/],
  [{ code: 'bad_code_verifier' }, /same browser/],
  [{ code: 'flow_state_expired' }, /expired/],
  [{ code: 'signup_disabled' }, /turned off/],
  [{ code: 'same_password' }, /different/],
  [{ status: 429 }, /Too many attempts/],
  [{ status: 500 }, /problem on its side/],
  [{ status: 502 }, /problem on its side/],
  [{ status: '503' }, /problem on its side/],
  [{ status: 0 }, /couldn’t reach/],
  [{ name: 'AuthRetryableFetchError' }, /couldn’t reach/],
  [{ message: 'Failed to fetch' }, /couldn’t reach/],
  [{ message: 'User already registered' }, /already exists/],
  [{ message: 'Password should be at least 6 characters' }, /too weak/],
  [{ message: 'Email not confirmed' }, /verify your email/],
  [{ code: 'unknown_code_xyz', message: 'secret db detail' }, /^Something went wrong/],
  [{}, /^Something went wrong/],
  ['a string', /^Something went wrong/],
];
for (const [err, expected] of ERROR_CASES) {
  test(`friendlyAuthError ${JSON.stringify(err)}`, () => {
    const msg = A.friendlyAuthError(err);
    assert.match(msg, expected);
    assert.ok(!msg.includes('secret db detail'));
  });
}
test('friendlyAuthError: null / undefined => empty string', () => {
  assert.equal(A.friendlyAuthError(null), '');
  assert.equal(A.friendlyAuthError(undefined), '');
});

test('parseAuthRedirect matrix', () => {
  const p = A.parseAuthRedirect;
  assert.deepEqual(p('?code=abc', ''), { hasAuthParams: true, isRecovery: false, errorCode: '' });
  assert.deepEqual(p('?flow=recovery', ''), { hasAuthParams: true, isRecovery: true, errorCode: '' });
  assert.deepEqual(p('', '#error=access_denied&error_code=otp_expired'), { hasAuthParams: true, isRecovery: false, errorCode: 'otp_expired' });
  assert.equal(p('?error_code=otp_expired&error=x', '').errorCode, 'otp_expired'); // error_code wins over error
  assert.equal(p('?error=access_denied', '').errorCode, 'access_denied');
  assert.equal(p('?flow=signup', '').hasAuthParams, true);
  assert.deepEqual(p('', ''), { hasAuthParams: false, isRecovery: false, errorCode: '' });
  assert.deepEqual(p(null, null), { hasAuthParams: false, isRecovery: false, errorCode: '' });
  assert.equal(p('?foo=bar', '#/history').hasAuthParams, false);
});

test('resolveAccessStatus matrix', () => {
  const r = A.resolveAccessStatus;
  assert.equal(r({ ready: false }), 'loading');
  assert.equal(r({ ready: false, session: { user: {} }, guest: true }), 'loading');
  assert.equal(r({ ready: true, session: { user: {} }, guest: true }), 'authenticated'); // account beats guest
  assert.equal(r({ ready: true, session: {}, guest: true }), 'guest'); // session without user is not a login
  assert.equal(r({ ready: true, session: { user: null }, guest: false }), 'signedOut');
  assert.equal(r({ ready: true, session: null, guest: true }), 'guest');
  assert.equal(r({ ready: true }), 'signedOut');
});

test('displayName / firstName fallbacks', () => {
  assert.equal(A.displayName(null, null), 'there');
  assert.equal(A.displayName({ email: '' }, null), 'there');
  assert.equal(A.displayName({ email: 'a.b@c.com' }, { full_name: '   ' }), 'a.b');
  assert.equal(A.displayName({ email: 'a.b@c.com', user_metadata: { full_name: 123 } }, null), 'a.b');
  assert.equal(A.displayName({ email: 'x@y.com' }, { full_name: '  Asha  ' }), 'Asha');
  assert.equal(A.firstName('  Asha  Rao '), 'Asha');
  assert.equal(A.firstName('   '), 'there');
  assert.equal(A.firstName(null), 'there');
});

// ============================================================ 4. HISTORY MAPPING

test('recordToRow: defaults, clipping, coercion', () => {
  const empty = recordToRow({});
  assert.equal(empty.risk_level, 'low');
  assert.equal(empty.matched_checks, 0);
  assert.deepEqual(empty.tactics, []);
  assert.equal(empty.scam_category, null);
  assert.equal(recordToRow({ bandKey: 'HIGH' }).risk_level, 'low'); // case-sensitive
  assert.equal(recordToRow({ matchedChecks: 3.9 }).matched_checks, 3); // truncated
  assert.equal(recordToRow({ matchedChecks: -4 }).matched_checks, 0);
  assert.equal(recordToRow({ matchedChecks: NaN }).matched_checks, 0);
  assert.equal(recordToRow({ matchedChecks: '5' }).matched_checks, 0); // strings rejected
  assert.deepEqual(recordToRow({ tactics: 'notarray' }).tactics, []);
  assert.equal(recordToRow({ tactics: new Array(50).fill('t') }).tactics.length, 20);
  assert.equal(recordToRow({ source: 's'.repeat(99) }).input_source.length, 30);
  assert.equal(recordToRow({ band: 'x'.repeat(500) }).risk_label.length, 120);
});

test('recordToRow output only has whitelisted columns (privacy)', () => {
  const row = recordToRow({ bandKey: 'high', text: 'SECRET', phrases: [{ quote: 'SECRET' }], user_id: 'evil' });
  assert.deepEqual(Object.keys(row).sort(), ['analyzed_at', 'category_label', 'input_source', 'language', 'matched_checks', 'risk_label', 'risk_level', 'rules_version', 'scam_category', 'tactics']);
  assert.ok(!JSON.stringify(row).includes('SECRET'));
});

test('rowToRecord: fallbacks and cloud flag', () => {
  const rec = rowToRecord({ id: '1', risk_level: 'low', created_at: '2026-01-01T00:00:00Z' });
  assert.equal(rec.categoryKey, 'unknown');
  assert.equal(rec.category, 'Uncategorised');
  assert.equal(rec.band, 'low');
  assert.equal(rec.hasText, false);
  assert.equal(rec.cloud, true);
  assert.equal(rec.date, '2026-01-01T00:00:00Z');
  assert.equal(rowToRecord({ id: '1', risk_level: 'low', analyzed_at: '2026-02-02', created_at: '2026-01-01' }).date, '2026-02-02'); // analyzed_at wins
  assert.deepEqual(rowToRecord({ id: '1', risk_level: 'low', tactics: 'x' }).tactics, []);
});

// ============================================================ 5. LOCAL STORAGE

function mockStorage({ throwOnRead = false, throwOnWrite = false } = {}) {
  const store = new Map();
  globalThis.window = {
    localStorage: {
      getItem: (k) => {
        if (throwOnRead) throw new Error('blocked');
        return store.has(k) ? store.get(k) : null;
      },
      setItem: (k, v) => {
        if (throwOnWrite) throw new Error('quota');
        store.set(k, String(v));
      },
      removeItem: (k) => store.delete(k),
    },
  };
  return store;
}

test('storage: defaults, corrupt JSON and wrong types fall back safely', () => {
  const store = mockStorage();
  assert.deepEqual(S.loadSettings(), { saveHistory: true, saveFullText: false, simpleMode: false });
  store.set(S.SETTINGS_KEY, '{bad json');
  assert.deepEqual(S.loadSettings(), S.DEFAULT_SETTINGS);
  store.set(S.SETTINGS_KEY, '"a string"');
  assert.deepEqual(S.loadSettings(), S.DEFAULT_SETTINGS);
  store.set(S.HISTORY_KEY, '{"not":"array"}');
  assert.deepEqual(S.loadHistory(), []);
  store.set(S.HISTORY_KEY, 'garbage');
  assert.deepEqual(S.loadHistory(), []);
});

test('storage: default settings are not persisted; changed ones are', () => {
  const store = mockStorage();
  S.saveSettings({ saveHistory: true, saveFullText: false, simpleMode: false });
  assert.equal(store.size, 0);
  S.saveSettings({ saveHistory: true, saveFullText: true });
  assert.ok(store.has(S.SETTINGS_KEY));
});

test('storage: history is capped at 50, empty list removes the key', () => {
  const store = mockStorage();
  S.saveHistory(Array.from({ length: 60 }, (_, i) => ({ id: String(i) })));
  assert.equal(JSON.parse(store.get(S.HISTORY_KEY)).length, S.MAX_RECORDS);
  S.saveHistory([]);
  assert.equal(store.has(S.HISTORY_KEY), false);
});

test('storage: quota exceeded / blocked storage never throws', () => {
  mockStorage({ throwOnWrite: true });
  assert.equal(S.saveHistory([{ id: 1 }]), false);
  assert.equal(S.saveSettings({ saveHistory: false, saveFullText: false }), false);
  mockStorage({ throwOnRead: true });
  assert.deepEqual(S.loadHistory(), []);
  assert.deepEqual(S.loadSettings(), S.DEFAULT_SETTINGS);
});

test('storage: toRecord stores text ONLY when saveFullText is on', () => {
  const r = run('Share your OTP now. Pay ₹500 registration fee today or your slot will be cancelled');
  const lean = S.toRecord(r, { saveHistory: true, saveFullText: false });
  assert.ok(!('text' in lean) && !('phrases' in lean));
  assert.equal(lean.hasText, false);
  const full = S.toRecord(r, { saveHistory: true, saveFullText: true });
  assert.equal(full.text, r.text);
  assert.equal(full.phrases.length, r.signals.length);
  assert.notEqual(S.toRecord(r, {}).id, S.toRecord(r, {}).id); // ids unique
});

test('storage: clearAllJaalBreakData leaves nothing behind', () => {
  const store = mockStorage();
  S.saveSettings({ saveHistory: false, saveFullText: true });
  S.saveHistory([{ id: 1 }]);
  assert.equal(S.clearAllJaalBreakData(), true);
  assert.equal(store.size, 0);
});

// ============================================================ 6. INCIDENT REPORT

test('report: empty form uses [not provided] and invents nothing', () => {
  const out = buildIncidentReport(EMPTY_REPORT_FIELDS, null);
  assert.ok(out.includes(`Date and time received: ${NOT_PROVIDED}`));
  assert.ok(out.includes('Money lost: Not sure'));
  assert.ok(!out.includes('Amount:'));
  assert.ok(!out.includes('Warning signs noted'));
});

test('report: money lost = yes adds amount / method / UTR; values are trimmed', () => {
  const a = run('Pay ₹500 registration fee today or your slot will be cancelled');
  const out = buildIncidentReport({ ...EMPTY_REPORT_FIELDS, moneyLost: 'yes', amount: ' ₹500 ', paymentMethod: 'UPI' }, a);
  assert.ok(out.includes('Amount: ₹500'));
  assert.ok(out.includes('Payment method (UPI, card, bank transfer…): UPI'));
  assert.ok(out.includes(`Transaction reference / UTR: ${NOT_PROVIDED}`));
  assert.ok(out.includes('- "Pay ₹500 registration fee" (Upfront-payment request)'));
});

test('report: unknown moneyLost value degrades to [not provided]', () => {
  assert.ok(buildIncidentReport({ moneyLost: 'weird' }, null).includes(`Money lost: ${NOT_PROVIDED}`));
});

test('report: always carries the "no OTP/PIN shared" note', () => {
  assert.ok(buildIncidentReport(EMPTY_REPORT_FIELDS, null).includes('will not share any OTP, PIN, password or CVV'));
});

// ============================================================ 7. SCENARIO ENGINE

test('scenarios: every path is 3 decisions; best = 6/6, worst = 0/6', () => {
  for (const sc of SCENARIOS) {
    assert.deepEqual(validateScenario(sc), [], sc.id);
    const paths = [];
    const walk = (id, p) => {
      for (const c of sc.steps[id].choices) {
        const np = [...p, { stepId: id, choiceId: c.id }];
        if (c.end) paths.push(np);
        else walk(c.next, np);
      }
    };
    walk(sc.start, []);
    const scores = paths.map((p) => buildLearningSummary(sc, p));
    assert.ok(scores.every((s) => s.totalDecisions === 3 && s.maxPoints === 6), sc.id);
    assert.equal(Math.max(...scores.map((s) => s.points)), 6, sc.id);
    assert.equal(Math.min(...scores.map((s) => s.points)), 0, sc.id);
    assert.ok(scores.every((s) => s.ending), `${sc.id}: every path has an ending`);
  }
});

test('scenarios: empty path and bad ids', () => {
  const empty = buildLearningSummary(SCENARIOS[0], []);
  assert.deepEqual([empty.totalDecisions, empty.points, empty.maxPoints, empty.ending], [0, 0, 0, null]);
  assert.throws(() => buildLearningSummary(SCENARIOS[0], [{ stepId: 'nope', choiceId: 'x' }]), TypeError);
});

test('scenarios: validateScenario catches every kind of authoring mistake', () => {
  const bad = {
    start: 'a',
    endings: {},
    steps: {
      a: { tactics: ['zzz'], choices: [{ id: 'x', rating: 'weird', tactics: [], next: 'ghost' }] },
      orphan: { tactics: [], choices: [] },
    },
  };
  const problems = validateScenario(bad);
  for (const expected of ['needs 2–3 choices', 'unknown tactic "zzz"', 'invalid rating', 'must name a tactic', 'next step "ghost" missing', 'needs consequence, explanation and nextAction', 'step "orphan" is unreachable']) {
    assert.ok(problems.some((p) => p.includes(expected)), `missing: ${expected}`);
  }
});

// ============================================================ 8. NEW BEHAVIOUR (v1.1.0)

test('normalisation: quotes stay verbatim substrings even when matching used a cleaned view', () => {
  const r = run('Sh\u200bare your O\u200bTP now');
  assert.equal(r.band.key, 'medium');
  for (const s of r.signals) assert.equal(r.text.slice(s.start, s.end), s.quote);
  assert.ok(r.signals[0].quote.includes('\u200b')); // the user's real text is quoted, not our cleaned copy
});

test('normalisation: a line break inside a phrase is quoted exactly', () => {
  const r = run('Share your\nOTP now');
  assert.equal(r.signals[0].quote, 'Share your\nOTP');
});

test('normalisation: a blank line still separates sentences', () => {
  const r = run('Never share your OTP\n\nShare your OTP with us');
  assert.deepEqual(quotes(r), ['Share your OTP']);
});

// Every way of hiding "Share your OTP" must still be detected at medium or above.
const OTP_VARIANTS = {
  plain: 'Share your OTP now',
  'ALL CAPS': 'SHARE YOUR OTP NOW',
  'zero-width inside': 'Sh\u200bare your O\u200bTP now',
  'zero-width joiner': 'Share\u200d your OT\u200dP now',
  'soft hyphen': 'Sha\u00adre your OT\u00adP now',
  'BOM character': '\uFEFFShare your OTP now',
  'full-width letters': 'Ｓｈａｒｅ ｙｏｕｒ ＯＴＰ ｎｏｗ',
  'spaced letters': 'Share your O T P now',
  'leet zero': 'Share your 0TP now',
  'leet zero spaced': 'Share your 0 T P now',
  'line break': 'Share your\nOTP now',
  'line break after verb': 'Share\nyour OTP now',
  'tabs': 'Share\tyour\tOTP now',
  'non-breaking spaces': 'Share\u00a0your\u00a0OTP\u00a0now',
  'double spaces': 'Share  your  OTP now',
  'CRLF': 'Share your\r\nOTP now',
};
for (const [name, text] of Object.entries(OTP_VARIANTS)) {
  test(`evasion variant detected: ${name}`, () => {
    const r = run(text);
    assert.notEqual(r.band.key, 'low');
    assert.ok(ruleIds(r).includes('CRD-01'));
    for (const s of r.signals) assert.equal(r.text.slice(s.start, s.end), s.quote);
  });
}

test('hidden / full-width characters add an explained +2 and a visible note', () => {
  const r = run('Sh\u200bare your O\u200bTP now');
  assert.ok(r.hiddenCharacters);
  assert.ok(r.scoreAdjustments.some((a) => a.kind === 'hidden' && a.points === 2));
  assert.ok(r.uncertainty.some((n) => n.includes('hidden or full-width')));
  const plain = run('Share your OTP now');
  assert.equal(plain.hiddenCharacters, false);
  assert.equal(r.score, plain.score + 2);
});

// Negation: genuine warnings stay low, disguised requests are still caught.
const MUST_BE_LOW = [
  'Never share your OTP with anyone.',
  'We will never, ever ask you to share your OTP.',
  'Please do not share your OTP or PIN with anyone.',
  'Remember NOT to share your OTP.',
  'Nobody from the bank will ask you to share your OTP.',
  'Meridian Bank never asks you to share your PIN or password.',
  'OTP kabhi share mat karo.',
  'Never ever, under any circumstances at all in the world, share your OTP.',
];
for (const text of MUST_BE_LOW) {
  test(`negation keeps genuine warning low: ${text.slice(0, 50)}`, () => {
    assert.equal(run(text).band.key, 'low');
  });
}
const MUST_FLAG = [
  'We never call you, but share your OTP now',
  'Do not worry, just share your OTP now',
  'Do not hesitate to share your OTP',
  'Do not delay and send your OTP now',
  'Never click links. Share your OTP now.',
  'Our bank does not charge fees however you must share your OTP',
];
for (const text of MUST_FLAG) {
  test(`negation does not hide a real request: ${text.slice(0, 50)}`, () => {
    assert.notEqual(run(text).band.key, 'low');
  });
}

test('scoring: repeat bonus applies to bait, not to urgency wording', () => {
  const lottery = run('You have won a lottery of Rs.5,00,000. Claim your prize now.');
  assert.equal(lottery.band.key, 'medium');
  assert.ok(lottery.scoreAdjustments.some((a) => a.kind === 'repeat'));
  const urgencyOnly = run('🚨🚨 URGENT 🚨🚨 act now!!!');
  assert.equal(urgencyOnly.band.key, 'low');
  assert.deepEqual(urgencyOnly.scoreAdjustments, []);
});

test('scoring: reward bait + payment demand gets a combo bonus', () => {
  const r = run('You have won a lottery! Pay a small fee via this QR to receive the prize.');
  assert.ok(r.scoreAdjustments.some((a) => a.kind === 'combo'));
});

test('scoring: total bonus from repeat + combo never exceeds 3', () => {
  const r = run('You have won a lottery. You have been shortlisted. Guaranteed returns, double your money, 100% safe! Pay the registration fee of Rs 500 via this QR. Buy Google Play cards and send the codes. Claim your prize at http://prize-claim.xyz');
  const bonus = r.scoreAdjustments.filter((a) => a.kind !== 'hidden').reduce((n, a) => n + a.points, 0);
  assert.ok(bonus <= 3, `bonus was ${bonus}`);
});

test('fee wording: demand or stated amount is strong, bare mention is weak', () => {
  assert.equal(run('Pay Rs 999 processing fee to receive Rs 50,000 in your account.').band.key, 'medium');
  assert.ok(ruleIds(run('Registration fee: Rs 500 payable today')).includes('FEE-01'));
  assert.ok(ruleIds(run('Please deposit the processing fee')).includes('FEE-01'));
  const info = run('The bank charges a processing fee of 1% on personal loans.');
  assert.equal(info.band.key, 'low');
  assert.deepEqual(ruleIds(info), ['FEE-03']);
});

test('gift cards: asking to buy or send codes is strong; plain mention is weak', () => {
  assert.ok(ruleIds(run('Buy Google Play cards and send the codes.')).includes('PAY-03'));
  assert.ok(ruleIds(run('Scratch the gift card and read out the code')).includes('PAY-03'));
  assert.ok(!ruleIds(run('Your Amazon gift card code is ABCD-1234. Enjoy!')).includes('PAY-03'));
});

test('blackmail category and advice exist', () => {
  const r = run('I have recorded your video. Pay Rs 20000 or I will leak it to all your contacts.');
  assert.equal(r.category.key, 'blackmail');
  assert.ok(r.advice.steps.some((step) => step.includes('1930')));
});

test('language: Hinglish is detected; ordinary English with "band" is not', () => {
  assert.equal(detectLanguage('Aapka account band ho jayega. Turant OTP bhejo.').code, 'hinglish');
  assert.equal(detectLanguage('The band played all night').code, 'en');
  assert.equal(run('Aapka account band ho jayega. Turant OTP bhejo.').language.supported, true);
});

test('links: brand look-alikes are flagged, official domains are not', () => {
  const flagged = ['hdfcbank-kyc.com', 'https://sbiloans.in/apply', 'https://paytm.com.evil.xyz', 'http://icici-secure-login.top', 'https://amazon-refund.in'];
  for (const url of flagged) {
    const a = assessLink(url);
    assert.equal(a.suspicious, true, url);
    assert.ok(a.reasons.some((r) => r.includes('official websites')) || a.reasons.length > 0, url);
  }
  assert.ok(assessLink('hdfcbank-kyc.com').reasons.some((r) => r.includes('hdfc')));
  const clean = ['https://www.hdfcbank.com', 'https://netbanking.hdfcbank.com/login', 'https://sbi.co.in/web', 'https://www.amazon.in/orders', 'https://s3.amazonaws.com/file', 'https://www.google.com'];
  for (const url of clean) assert.equal(assessLink(url).suspicious, false, url);
});

test('links: punycode prefix is not counted as hyphens', () => {
  const reasons = assessLink('https://xn--pple-43d.com').reasons;
  assert.ok(reasons.some((r) => r.includes('punycode')));
  assert.ok(!reasons.some((r) => r.includes('several hyphens')));
  assert.ok(assessLink('https://a-b-c.com').reasons.some((r) => r.includes('several hyphens')));
});

// Robustness: random mixtures of scam phrases, safe phrases and awkward characters.
test('property: random messages never crash and every quote is grounded and deterministic', () => {
  let seed = 12345;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const pool = [
    'Share your OTP', 'Never share your OTP', 'Update your KYC', 'Pay ₹500 registration fee', 'You have won a lottery',
    'http://bit.ly/abc', 'www.sbi-login.top', 'Install AnyDesk', 'Dear Customer', 'hello', 'lunch at 1?', '🚨', 'Ｓｈａｒｅ',
    '\u200b', '\n', '\r\n', '\t', '   ', 'आपका खाता बंद हो जाएगा', 'OTP bhejo', "'; DROP TABLE x; --", '<script>', '0TP', 'O T P', '.', '!', ',', 'but',
  ];
  for (let i = 0; i < 400; i += 1) {
    const parts = Array.from({ length: 1 + Math.floor(rand() * 8) }, () => pool[Math.floor(rand() * pool.length)]);
    const text = parts.join(rand() < 0.5 ? ' ' : '');
    if (!text.trim() || !text.replace(/[\u200b]/g, '').trim()) continue;
    const a = run(text);
    const b = run(text);
    assert.deepEqual([a.band.key, a.score, a.signals.map((x) => [x.ruleId, x.start, x.end])], [b.band.key, b.score, b.signals.map((x) => [x.ruleId, x.start, x.end])]);
    assert.ok(['low', 'medium', 'high'].includes(a.band.key));
    assert.ok(a.score >= 0);
    let last = -1;
    for (const sig of a.signals) {
      assert.equal(a.text.slice(sig.start, sig.end), sig.quote, JSON.stringify(text));
      assert.ok(sig.start >= last, 'signals must not overlap');
      last = sig.end;
    }
  }
});

// ---- fixes from the 22 Oct 2026 test report
test('fixed: "guaranteed 3x returns" (words between) is caught', () => {
  assert.ok(ruleIds(run('Invest 10k and get guaranteed 3x returns in 7 days.')).includes('OFR-02'));
});
test('fixed: "3x returns" on its own is caught', () => {
  assert.ok(ruleIds(run('Invest 10k and get 3x returns in 7 days.')).includes('OFR-02'));
});
test('fixed: "join our Telegram group" counts as channel switching', () => {
  assert.ok(ruleIds(run('Join our Telegram group now for daily tips.')).includes('CHN-01'));
});
test('fixed: electricity disconnection threat gets the utility category, not bank/KYC', () => {
  const r = run('Your electricity connection will be disconnected tonight. Call 9876543210 immediately.');
  assert.equal(r.category.key, 'utility_bill');
  assert.notEqual(r.band.key, 'low');
});
test('bank account blocking still goes to bank/KYC', () => {
  assert.equal(run('Dear Customer, your account will be blocked. Update your KYC.').category.key, 'bank_kyc');
});
test('genuine messages stay low after the new patterns', () => {
  for (const t of [
    'Your OTP for login is 482913. Do not share it with anyone. -HDFC Bank',
    'Scheduled maintenance: power supply in Sector 4 will be off 10 AM-1 PM on Sunday.',
    'Mutual fund investments are subject to market risks. Returns are not guaranteed.',
    'Rs 45,000 credited to your a/c XX1234 on 01-Oct.',
  ]) assert.equal(run(t).band.key, 'low', t);
});

// ---- v1.2 link checks: typo look-alikes, tunnels, free hosts ----------------
import { typoLookalike } from './linkCheck.js';
test('typo look-alike domains are caught', () => {
  assert.equal(typoLookalike('hdfcbnak.com'), 'hdfcbank');
  assert.equal(typoLookalike('lnstagram-help.com'), 'instagram');
  assert.equal(typoLookalike('paytrn.in'), 'paytm');
  assert.equal(typoLookalike('faceb00k.com'), 'facebook');
});
test('real domains are not called typo look-alikes', () => {
  for (const h of ['hdfcbank.com', 'www.instagram.com', 'paytm.com', 'onlinesbi.sbi', 'amazon.in', 'scam-shield-01.vercel.app', 'example.com', 'zomato.com', 'swiggy.com', 'myntra.com', 'gmail.com']) {
    assert.equal(typoLookalike(h), null, h);
  }
});
test('ngrok tunnel links are flagged', () => {
  assert.ok(assessLink('http://8a82baad3d7d.ngrok.io/sbibank').reasons.some((r) => r.includes('tunnel')));
});
test('free host + brand name is flagged, free host alone is not', () => {
  assert.ok(assessLink('https://sbi-kyc.000webhostapp.com').suspicious);
  assert.ok(!assessLink('https://jaalbreak.vercel.app').reasons.some((r) => r.includes('free website builder')));
  assert.equal(assessLink('https://jaalbreak.vercel.app').suspicious, false);
});

// ---- Kannada (beta) ----------------------------------------------------------
test('Kannada: genuine "never share your OTP" warning is not flagged', () => {
  assert.equal(run('ನಿಮ್ಮ OTP ಅನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ').band.key, 'low');
});
test('Kannada: KYC block scam reaches strong', () => {
  const r = run('ಆತ್ಮೀಯ ಗ್ರಾಹಕರೇ, ನಿಮ್ಮ ಖಾತೆ ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ. ತಕ್ಷಣ KYC ಅಪ್ಡೇಟ್ ಮಾಡಿ ಮತ್ತು OTP ಹಂಚಿಕೊಳ್ಳಿ.');
  assert.equal(r.band.key, 'high');
  assert.ok(['kn', 'kn-mixed'].includes(r.language.code));
});
test('Kannada script is detected and no longer called unreviewed', () => {
  assert.equal(detectLanguage('ನಿಮ್ಮ ಖಾತೆ ಬ್ಲಾಕ್ ಆಗುತ್ತದೆ').code, 'kn');
});
test('Kanglish is detected', () => {
  assert.equal(detectLanguage('Nimma account block aagutte, OTP heli').code, 'kanglish');
});
test('Kanglish: "OTP yarigu helbedi" (never tell OTP) is not flagged', () => {
  assert.equal(run('Nimma OTP yarigu helbedi').band.key, 'low');
});

// ---- v1.2 input helpers -------------------------------------------------------
import { extractUpiIds, assessUpi, parseUpiUri, qrToText } from './upiCheck.js';
import { assessEmail } from './emailCheck.js';
import { detectInputKind } from './inputDetect.js';
test('UPI: ids are extracted, emails are not', () => {
  assert.deepEqual(extractUpiIds('pay to ramesh.k@okaxis or write to help@company.com'), ['ramesh.k@okaxis']);
});
test('UPI: lure names and unknown handles are flagged, normal ids are not', () => {
  assert.ok(assessUpi('sbi.refund@ybl').suspicious);
  assert.ok(assessUpi('ravi@freeupi').suspicious);
  assert.equal(assessUpi('ravi.kumar@okhdfcbank').suspicious, false);
});
test('UPI QR payload is parsed', () => {
  const q = parseUpiUri('upi://pay?pa=cashback.offer@ybl&pn=Cashback%20Desk&am=499&tn=claim');
  assert.equal(q.payee, 'cashback.offer@ybl');
  assert.equal(q.amount, '499');
});
test('email: bank name from a gmail address is flagged; reply-to mismatch is flagged', () => {
  const r = assessEmail('From: SBI Security Team <sbi.alerts.team@gmail.com>\nReply-To: claims@helpdesk-mail.xyz\nSubject: KYC update');
  assert.ok(r.suspicious);
  assert.ok(r.reasons.some((x) => x.includes('free gmail.com')));
  assert.ok(r.reasons.some((x) => x.includes('Replies go to')));
});
test('email: a normal company email is not flagged', () => {
  const r = assessEmail('From: HDFC Bank <alerts@hdfcbank.net>\nSubject: Your statement');
  assert.equal(r.suspicious, false);
});
test('input kind detection', () => {
  assert.equal(detectInputKind('http://sbi-kyc.xyz/login'), 'link');
  assert.equal(detectInputKind('refund.desk@ybl'), 'upi');
  assert.equal(detectInputKind('upi://pay?pa=a@ybl&am=1'), 'upi-qr');
  assert.equal(detectInputKind('From: X <a@b.com>\nSubject: hi'), 'email');
  assert.equal(detectInputKind('Your account will be blocked today'), 'message');
});

test('QR: a UPI QR becomes plain text that names who gets paid', () => {
  const t = qrToText('upi://pay?pa=sbi.refund@ybl&pn=SBI%20Refund&am=10');
  assert.ok(t.includes('pays ₹10 to sbi.refund@ybl'));
  assert.ok(ruleIds(run(t)).includes('UPI-01'));
});
test('QR: a link QR is passed through unchanged', () => {
  assert.equal(qrToText('https://example.com/x'), 'https://example.com/x');
});

test('a "payment screenshot" request is not called an account takeover', () => {
  assert.ok(!ruleIds(run('Send the payment screenshot to HR')).includes('ATO-03'));
});

import { historyToCsv } from './historyExport.js';
test('history CSV: header, escaping and formula protection', () => {
  const csv = historyToCsv([{ date: '2026-10-29T10:00:00Z', band: 'Strong', category: 'Bank, KYC', tactics: ['Urgency'], matchedChecks: 3, source: 'pasted', language: 'English', rulesVersion: '1.2.0', text: '=HYPERLINK("x")' }]);
  assert.ok(csv.startsWith('\uFEFFDate,Assessment'));
  assert.ok(csv.includes('"Bank, KYC"'));
  assert.ok(csv.includes(`"'=HYPERLINK(""x"")"`));
});

import { buildCommunityReport } from './communityReport.js';
test('community report never contains the message, links or numbers', () => {
  const r = run('Dear customer your SBI account will be blocked today. Call 9876543210 and open http://sbi-kyc.xyz');
  const rep = buildCommunityReport(r, 'whatsapp');
  assert.deepEqual(Object.keys(rep).sort(), ['band', 'category', 'channel', 'language', 'rules_version', 'tactics']);
  const json = JSON.stringify(rep);
  assert.ok(!json.includes('9876543210') && !json.includes('sbi-kyc') && !json.includes('blocked'));
  assert.equal(buildCommunityReport(r, 'evil').channel, 'other');
});
