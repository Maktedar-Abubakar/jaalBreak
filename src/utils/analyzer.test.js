// ---------------------------------------------------------------------------
// Analyzer tests — run with:  npm test
// Uses Node's built-in test runner, so no extra packages are needed.
// These map directly to the acceptance criteria in the engineering report.
// ---------------------------------------------------------------------------

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessage, verifySignals, normaliseInput } from './analyzer.js';
import { SAMPLE_MESSAGES, SAMPLE_SCREENSHOT } from '../data/sampleMessages.js';
import { SCENARIOS } from '../data/scenarios/index.js';
import { validateScenario } from './scenarioEngine.js';

const sample = (id) => SAMPLE_MESSAGES.find((m) => m.id === id).text;

function assertGrounded(result) {
  for (const s of result.signals) {
    assert.equal(result.text.slice(s.start, s.end), s.quote, `quote at position must match: ${s.quote}`);
    assert.ok(result.text.includes(s.quote));
  }
}

test('report example: internship message returns strong band and the three report phrases', () => {
  const r = analyzeMessage(sample('internship-fee'));
  assert.equal(r.band.key, 'high');
  assert.ok(r.signals.length >= 2);
  const quotes = r.signals.map((s) => s.quote);
  assert.ok(quotes.includes('Pay ₹2,500 registration fee'), quotes.join(' | '));
  assert.ok(quotes.includes('today or your slot will be cancelled'), quotes.join(' | '));
  assert.ok(quotes.includes('Contact us on Telegram only'), quotes.join(' | '));
  assert.equal(r.category.key, 'job_fee');
  assertGrounded(r);
});

test('bank KYC sample: strong band, bank category, OTP request and suspicious link found', () => {
  const r = analyzeMessage(sample('bank-kyc'));
  assert.equal(r.band.key, 'high');
  assert.equal(r.category.key, 'bank_kyc');
  const tactics = r.signals.map((s) => s.tactic);
  assert.ok(tactics.includes('credential_request'));
  assert.ok(tactics.includes('suspicious_link'));
  assertGrounded(r);
});

test('legitimate-looking message is not labelled a strong match', () => {
  const r = analyzeMessage(sample('legit-delivery'));
  assert.equal(r.band.key, 'low');
  // "never ask you to share your OTP" must NOT count as an OTP request.
  assert.ok(!r.signals.some((s) => s.tactic === 'credential_request'));
});

test('generic "Dear Customer" alone stays in the lowest band', () => {
  const r = analyzeMessage('Dear Customer, your monthly statement for September is now available in the app.');
  assert.equal(r.band.key, 'low');
});

test('Hindi message is analysed with verified Devanagari evidence', () => {
  const r = analyzeMessage(sample('hindi-kyc'));
  assert.equal(r.band.key, 'high');
  assert.ok(['hi', 'mixed'].includes(r.language.code));
  assert.ok(r.signals.some((s) => /[ऀ-ॿ]/u.test(s.quote)));
  assertGrounded(r);
});

test('family emergency sample reaches the strong band', () => {
  const r = analyzeMessage(sample('family-emergency'));
  assert.equal(r.band.key, 'high');
  assert.equal(r.category.key, 'family_emergency');
  assertGrounded(r);
});

test('screenshot transcript (delivery fee) is detected', () => {
  const r = analyzeMessage(SAMPLE_SCREENSHOT.transcript);
  assert.equal(r.band.key, 'high');
  assert.equal(r.category.key, 'delivery_fee');
});

test('same input always gives the same verdict and evidence', () => {
  for (const m of SAMPLE_MESSAGES) {
    const a = analyzeMessage(m.text);
    const b = analyzeMessage(m.text);
    assert.equal(a.band.key, b.band.key);
    assert.deepEqual(
      a.signals.map((s) => [s.ruleId, s.start, s.end]),
      b.signals.map((s) => [s.ruleId, s.start, s.end])
    );
  }
});

test('every sample produces only grounded quotes', () => {
  for (const m of SAMPLE_MESSAGES) assertGrounded(analyzeMessage(m.text));
});

test('span verification discards quotes that are not in the text', () => {
  const text = 'Pay the fee now';
  const { verified, discarded } = verifySignals(text, [
    { quote: 'Pay the fee', start: 0, end: 11 },
    { quote: 'invented phrase', start: 0, end: 15 },
    { quote: 'fee now', start: 0, end: 7 },
  ]);
  assert.equal(verified.length, 1);
  assert.equal(discarded, 2);
});

test('normalisation only unifies line endings and Unicode form', () => {
  assert.equal(normaliseInput('a\r\nb\rc'), 'a\nb\nc');
});

test('empty input is rejected', () => {
  assert.throws(() => analyzeMessage('   '));
});

test('curly apostrophes from phones still match', () => {
  const r = analyzeMessage('Mom it’s me, I’m in trouble. Don’t tell anyone. Send the money now please.');
  assert.ok(r.signals.some((s) => s.tactic === 'secrecy'));
  assert.ok(r.signals.some((s) => s.tactic === 'emotional_pressure'));
});

test('unreviewed languages are labelled', () => {
  const r = analyzeMessage('మీ ఖాతా బ్లాక్ చేయబడుతుంది, వెంటనే OTP పంపండి');
  assert.equal(r.language.supported, false);
});

test('all four simulator scenarios are valid and every choice names a tactic', () => {
  assert.equal(SCENARIOS.length, 4);
  for (const scenario of SCENARIOS) {
    const problems = validateScenario(scenario);
    assert.deepEqual(problems, [], `${scenario.id}: ${problems.join('; ')}`);
  }
});
