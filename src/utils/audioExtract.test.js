import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SAMPLE_VOICE_CALLS,
  identifyCallScamWords,
  speechRecognitionSupported,
} from './audioExtract.js';

test('audioExtract: SAMPLE_VOICE_CALLS contains expected call scenarios', () => {
  assert.ok(SAMPLE_VOICE_CALLS.length >= 4);
  for (const call of SAMPLE_VOICE_CALLS) {
    assert.ok(call.id);
    assert.ok(call.title);
    assert.ok(call.transcript);
    assert.ok(call.duration);
  }
});

test('audioExtract: speechRecognitionSupported returns boolean without crashing', () => {
  const supported = speechRecognitionSupported();
  assert.equal(typeof supported, 'boolean');
});

test('audioExtract: identifyCallScamWords handles empty/whitespace input safely', () => {
  const res1 = identifyCallScamWords('');
  assert.equal(res1.analysis, null);
  assert.equal(res1.totalCount, 0);

  const res2 = identifyCallScamWords('   ');
  assert.equal(res2.analysis, null);
  assert.equal(res2.totalCount, 0);
});

test('audioExtract: identifies digital arrest call scam words and produces high risk band', () => {
  const call = SAMPLE_VOICE_CALLS.find((c) => c.id === 'digital-arrest');
  const result = identifyCallScamWords(call.transcript);

  assert.ok(result.analysis);
  assert.equal(result.analysis.band.key, 'high');
  assert.ok(result.scamWords.length > 0);
  assert.ok(result.highRiskCount > 0);

  const words = result.scamWords.map((w) => w.word.toLowerCase());
  assert.ok(words.some((w) => w.includes('digital arrest')));
  assert.ok(words.some((w) => w.includes('money laundering') || w.includes('safe account') || w.includes('police')));
});

test('audioExtract: identifies bank KYC suspension scam call words and OTP demand', () => {
  const call = SAMPLE_VOICE_CALLS.find((c) => c.id === 'bank-kyc-call');
  const result = identifyCallScamWords(call.transcript);

  assert.ok(result.analysis);
  assert.ok(result.analysis.band.key === 'high' || result.analysis.band.key === 'medium');

  const words = result.scamWords.map((w) => w.word.toLowerCase());
  assert.ok(words.some((w) => w.includes('otp')));
  assert.ok(words.some((w) => w.includes('block') || w.includes('kyc')));
});

test('audioExtract: identifies job offer registration fee call', () => {
  const call = SAMPLE_VOICE_CALLS.find((c) => c.id === 'job-fee-call');
  const result = identifyCallScamWords(call.transcript);

  assert.ok(result.analysis);
  assert.equal(result.analysis.band.key, 'high');
  const words = result.scamWords.map((w) => w.word.toLowerCase());
  assert.ok(words.some((w) => w.includes('registration fee') || w.includes('fee')));
});
