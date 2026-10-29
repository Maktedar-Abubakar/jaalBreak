// History separation and privacy tests — run with:  npm test

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessage } from './analyzer.js';
import { toRecord, DEFAULT_SETTINGS } from './storage.js';
import { recordToRow, rowToRecord, HISTORY_COLUMNS } from './historyMapping.js';
import { SAMPLE_MESSAGES } from '../data/sampleMessages.js';

const text = SAMPLE_MESSAGES.find((m) => m.id === 'bank-kyc').text;

test('account rows never contain message text or evidence, even if full-text saving is on', () => {
  const result = analyzeMessage(text);
  const local = toRecord(result, { ...DEFAULT_SETTINGS, saveFullText: true });
  assert.equal(local.hasText, true, 'guest/local record can hold text when opted in');

  const row = recordToRow(local);
  const serialised = JSON.stringify(row);
  assert.ok(!('text' in row) && !('phrases' in row) && !('user_id' in row));
  for (const s of result.signals) {
    assert.ok(!serialised.includes(s.quote), `quote leaked into row: ${s.quote}`);
  }
  assert.ok(!HISTORY_COLUMNS.includes('text'));
});

test('row has the schema fields and valid values', () => {
  const row = recordToRow(toRecord(analyzeMessage(text), DEFAULT_SETTINGS));
  assert.ok(['low', 'medium', 'high'].includes(row.risk_level));
  assert.equal(row.risk_level, 'high');
  assert.equal(row.scam_category, 'bank_kyc');
  assert.ok(Array.isArray(row.tactics) && row.tactics.length > 0);
  assert.ok(Number.isInteger(row.matched_checks));
  assert.ok(!Number.isNaN(Date.parse(row.analyzed_at)));
});

test('unknown band falls back to low; long values are clipped', () => {
  const row = recordToRow({ bandKey: 'bogus', category: 'x'.repeat(500), tactics: new Array(50).fill('t') });
  assert.equal(row.risk_level, 'low');
  assert.equal(row.category_label.length, 120);
  assert.equal(row.tactics.length, 20);
});

test('round trip: database row -> record the History page can show', () => {
  const record = toRecord(analyzeMessage(text), DEFAULT_SETTINGS);
  const row = { ...recordToRow(record), id: '6c1f0d4e-0000-4000-8000-000000000000', created_at: record.date };
  const back = rowToRecord(row);
  assert.equal(back.id, row.id);
  assert.equal(back.bandKey, record.bandKey);
  assert.equal(back.band, record.band);
  assert.equal(back.category, record.category);
  assert.equal(back.matchedChecks, record.matchedChecks);
  assert.deepEqual(back.tactics, record.tactics);
  assert.equal(back.hasText, false);
});
