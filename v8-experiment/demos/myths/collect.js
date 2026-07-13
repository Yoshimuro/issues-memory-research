'use strict';
// raw-runs.jsonl (все повторы) -> results.jsonl (медиана 5 повторов на ячейку)
const fs = require('fs');
const path = require('path');
const raw = fs.readFileSync(path.join(__dirname, 'raw-runs.jsonl'), 'utf8')
  .trim().split('\n').map(JSON.parse);
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };

const groups = {};
const errors = [];
for (const r of raw) {
  if (r.data.error) { errors.push(r); continue; }
  const k = `${r.runtime}|${r.data.bench}|${r.data.case}`;
  (groups[k] = groups[k] || []).push(r.data.ms);
}
const out = [];
for (const [k, arr] of Object.entries(groups)) {
  const [runtime, bench, cs] = k.split('|');
  out.push({ runtime, bench, case: cs, ms: med(arr), reps: arr.length,
             spread: +(Math.max(...arr) - Math.min(...arr)).toFixed(1) });
}
fs.writeFileSync(path.join(__dirname, 'results.jsonl'),
  out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log('cells:', out.length, '| errors:', errors.length);
if (errors.length) console.log('ERRORS:', JSON.stringify(errors.slice(0, 5)));
