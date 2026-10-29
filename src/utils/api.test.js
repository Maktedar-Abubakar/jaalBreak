import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler, { toApiResult } from '../../api/check.js';
import { analyzeMessage, MAX_INPUT_LENGTH, RULES_VERSION } from './analyzer.js';

test('api: toApiResult maps analyzer output cleanly and safely', () => {
  const result = analyzeMessage('Dear customer your bank account will be blocked. Update KYC at http://phish.xyz and send OTP.');
  const apiRes = toApiResult(result);

  assert.equal(apiRes.rulesVersion, RULES_VERSION);
  assert.equal(apiRes.risk.level, 'high');
  assert.equal(apiRes.category.key, 'bank_kyc');
  assert.ok(Array.isArray(apiRes.signals));
  assert.ok(apiRes.signals.length > 0);
  assert.ok(Array.isArray(apiRes.links));
  assert.ok(apiRes.advice.headline);
  assert.ok(Array.isArray(apiRes.advice.steps));
  assert.ok(Array.isArray(apiRes.notes));
  assert.ok(apiRes.disclaimer.includes('Rule-based'));

  // Ensure every signal has required fields
  for (const s of apiRes.signals) {
    assert.ok(s.rule);
    assert.ok(s.tactic);
    assert.ok(s.quote);
    assert.equal(typeof s.weight, 'number');
  }
});

function createMockRes() {
  const headers = {};
  const res = {
    statusCode: 200,
    body: null,
    headers,
    setHeader(name, value) {
      headers[name] = value;
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    end() {
      return this;
    },
  };
  return res;
}

test('api: handler GET returns API usage info', async () => {
  const req = { method: 'GET' };
  const res = createMockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.name, 'JaalBreak check API');
  assert.equal(res.body.rulesVersion, RULES_VERSION);
  assert.ok(res.headers['Access-Control-Allow-Origin']);
});

test('api: handler OPTIONS returns 204 No Content for CORS preflight', async () => {
  const req = { method: 'OPTIONS' };
  const res = createMockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 204);
  assert.equal(res.headers['Access-Control-Allow-Origin'], '*');
});

test('api: handler non-POST/GET returns 405 Method Not Allowed', async () => {
  const req = { method: 'DELETE' };
  const res = createMockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 405);
  assert.ok(res.body.error);
});

test('api: handler POST with invalid JSON returns 400', async () => {
  const req = { method: 'POST', body: 'not-valid-json' };
  const res = createMockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.ok(res.body.error);
});

test('api: handler POST with empty text returns 400', async () => {
  const req = { method: 'POST', body: { text: '   ' } };
  const res = createMockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 400);
  assert.ok(res.body.error);
});

test('api: handler POST with oversized text returns 413', async () => {
  const oversized = 'a'.repeat(MAX_INPUT_LENGTH + 1);
  const req = { method: 'POST', body: { text: oversized } };
  const res = createMockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 413);
  assert.ok(res.body.error.includes(String(MAX_INPUT_LENGTH)));
});

test('api: handler POST with valid message returns 200 and result', async () => {
  const req = {
    method: 'POST',
    body: { text: 'Dear customer your bank account will be blocked. Update KYC at http://phish.xyz and send OTP.' },
  };
  const res = createMockRes();
  await handler(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.risk.level, 'high');
  assert.equal(res.body.category.key, 'bank_kyc');
});
