// Re-score the engine on the hand-checked samples.
// Usage (from the project folder):  node tools/benchmark/score.mjs
// S = real scam, P = promotion/spam (not a scam), G = genuine, U = unclear (ignored).
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { analyzeMessage } from '../../src/utils/analyzer.js';
const dir = path.dirname(fileURLToPath(import.meta.url));
const pct = (a, b) => (b ? `${((100 * a) / b).toFixed(1)}%` : '-');
for (const set of ['holdout150', 'sample400']) {
  const lab = {};
  for (const t of fs.readFileSync(`${dir}/${set}_labels.txt`, 'utf8').split(/[|\n]/)) {
    const m = t.trim().match(/^(\d+) ([SPGU])$/);
    if (m) lab[+m[1]] = m[2];
  }
  const rows = JSON.parse(fs.readFileSync(`${dir}/${set}_messages.json`, 'utf8')).map((x) => ({ gold: lab[x.n], band: analyzeMessage(x.text).band.key }));
  console.log(`\n${set}`);
  for (const [g, name] of [['S', 'real scams caught'], ['P', 'promotions flagged'], ['G', 'genuine flagged (false alarm)']]) {
    const s = rows.filter((x) => x.gold === g);
    console.log(`  ${name.padEnd(30)} ${pct(s.filter((x) => x.band !== 'low').length, s.length).padStart(6)}  (Strong: ${pct(s.filter((x) => x.band === 'high').length, s.length)}, n=${s.length})`);
  }
}
