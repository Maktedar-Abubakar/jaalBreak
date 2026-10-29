// Export history as CSV (for Excel / Sheets) or as a printable page (Save as PDF).
// Contains only what is already in history: summaries, plus message text only
// if the user opted in to saving it.
import { formatDateTime } from './format.js';

const COLUMNS = [
  ['Date', (r) => formatDateTime(r.date)],
  ['Assessment', (r) => r.band],
  ['Category', (r) => r.category],
  ['Tactics', (r) => (r.tactics || []).join('; ')],
  ['Checks matched', (r) => r.matchedChecks],
  ['Input', (r) => r.source],
  ['Language', (r) => r.language],
  ['Rules version', (r) => r.rulesVersion],
  ['Message (only if you chose to save it)', (r) => r.text || ''],
];

function csvCell(v) {
  const s = String(v ?? '');
  // Leading = + - @ would run as a formula in Excel: prefix with a quote.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function historyToCsv(records) {
  const lines = [COLUMNS.map(([h]) => h).join(',')];
  for (const r of records) lines.push(COLUMNS.map(([, f]) => csvCell(f(r))).join(','));
  return `﻿${lines.join('\r\n')}`; // BOM so Excel reads Hindi/Kannada correctly
}

const esc = (s) => String(s ?? '').replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);

export function historyToPrintableHtml(records) {
  const rows = records
    .map((r) => `<tr>${COLUMNS.slice(0, 6).map(([, f]) => `<td>${esc(f(r))}</td>`).join('')}</tr>`)
    .join('');
  const counts = {};
  for (const r of records) counts[r.category] = (counts[r.category] || 0) + 1;
  const summary = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([c, n]) => `<li>${esc(c)}: ${n}</li>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>JaalBreak history</title>
<style>body{font-family:system-ui,sans-serif;margin:32px;color:#202a35}h1{font-size:22px;color:#14263d}table{border-collapse:collapse;width:100%;font-size:12px}th,td{border:1px solid #c5ced8;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eef1f4}p{font-size:12px;color:#657180}</style>
</head><body><h1>JaalBreak — analysis history</h1><p>Exported ${esc(formatDateTime(new Date().toISOString()))}. ${records.length} record(s). Assessments are rule-based warning signs, not proof of fraud.</p>
<ul>${summary}</ul><table><thead><tr>${COLUMNS.slice(0, 6).map(([h]) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
<script>window.onload=()=>window.print()</script></body></html>`;
}

export function downloadFile(name, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
