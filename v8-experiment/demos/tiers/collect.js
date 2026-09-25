'use strict';
// raw-runs.jsonl (все повторы) + traces.jsonl (счётчики) -> results.jsonl (медиана 5 повторов на ячейку)
const fs = require('fs');
const path = require('path');
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const raw = rd('raw-runs.jsonl');
const traces = fs.existsSync(path.join(__dirname, 'traces.jsonl')) ? rd('traces.jsonl') : [];
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };

const FIELDS = ['coldMs', 'coldCreateMs', 'coldCallMs', 'hotIters', 'hotPeakPerMs', 'hotFirstWindowPerMs', 'hotTimeTo90Ms',
  'unstableMs', 'unstableAMs', 'unstableBMs', 'unstableMixMs', 'rssMB', 'heapUsedMB', 'codeKB', 'bytecodeKB'];

const groups = {}, errors = {}, order = [];
for (const r of raw) {
  const k = `${r.runtime}|${r.variant}`;
  if (!groups[k] && !errors[k]) order.push(k);
  if (r.data.error) { (errors[k] = errors[k] || []).push(r.data.error); continue; }
  (groups[k] = groups[k] || []).push(r.data);
}
const out = [];
for (const k of order) {
  const [runtime, variant] = k.split('|');
  const tr = traces.find(t => t.runtime === runtime && t.variant === variant) || {};
  const row = { runtime, variant, reps: (groups[k] || []).length };
  if (!groups[k]) { row.error = errors[k][0]; out.push(row); continue; }
  for (const f of FIELDS) {
    const vals = groups[k].map(d => d[f]).filter(v => typeof v === 'number');
    row[f] = vals.length ? med(vals) : null;
  }
  row.coldSpread = +(Math.max(...groups[k].map(d => d.coldMs)) - Math.min(...groups[k].map(d => d.coldMs))).toFixed(1);
  row.hotPeakSpread = +(Math.max(...groups[k].map(d => d.hotPeakPerMs)) - Math.min(...groups[k].map(d => d.hotPeakPerMs))).toFixed(0);
  row.params = groups[k][0].params;
  row.maglevCompiles = tr.maglevCompiles ?? null;
  row.turbofanCompiles = tr.turbofanCompiles ?? null;
  row.deopts = tr.deopts ?? null;
  row.alwaysTurbofanLines = tr.alwaysTurbofanLines ?? null;
  if (errors[k]) row.partialErrors = errors[k].length;
  out.push(row);
}
fs.writeFileSync(path.join(__dirname, 'results.jsonl'), out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log('cells:', out.length, '| cells with errors:', Object.keys(errors).length);
for (const k of Object.keys(errors)) console.log('ERROR', k, errors[k][0].slice(0, 200));
