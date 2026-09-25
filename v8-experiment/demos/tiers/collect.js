'use strict';
// raw-runs.jsonl (все повторы) + traces.jsonl (счётчики) -> results.jsonl
// На ячейку: медиана по повторам + min/max (cold, hot steady) + все значения hot steady (отсортированы) — чтобы
// бимодальность была видна, а не пряталась за одной медианой.
const fs = require('fs');
const path = require('path');
const rd = f => fs.readFileSync(path.join(__dirname, f), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse);
const raw = rd('raw-runs.jsonl');
const traces = fs.existsSync(path.join(__dirname, 'traces.jsonl')) ? rd('traces.jsonl') : [];
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };

const FIELDS = ['coldMs', 'coldCreateMs', 'coldCallMs', 'hotIters', 'hotSteadyPerMs', 'hotPeakPerMs', 'hotFirstWindowPerMs', 'hotTimeTo90Ms',
  'unstableMs', 'unstableAMs', 'unstableBMs', 'unstableMixMs',
  'unstableA1Ms', 'unstableA2Ms', 'unstableB1Ms', 'unstableB2Ms', 'unstableMix1Ms', 'unstableMix2Ms',
  'gcCold', 'gcHot', 'gcUnstable', 'deoptsRep', 'deoptsHarnessRep', 'deoptsHotHarnessRep',
  'rssMB', 'heapUsedMB', 'codeKB', 'bytecodeKB'];

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
  const g = groups[k];
  for (const f of FIELDS) {
    const vals = g.map(d => d[f]).filter(v => typeof v === 'number');
    row[f] = vals.length ? med(vals) : null;
  }
  const colds = g.map(d => d.coldMs), hots = g.map(d => d.hotSteadyPerMs);
  row.coldMin = Math.min(...colds); row.coldMax = Math.max(...colds);
  row.coldSpread = +(row.coldMax - row.coldMin).toFixed(1);
  row.hotSteadyMin = Math.min(...hots); row.hotSteadyMax = Math.max(...hots);
  row.hotSteadySpread = +(row.hotSteadyMax - row.hotSteadyMin).toFixed(0);
  row.hotSteadyAll = [...hots].sort((a, b) => a - b).map(v => Math.round(v / 1000)); // k it/ms, по возрастанию
  row.deoptsHotHarnessAll = g.map(d => d.deoptsHotHarnessRep);
  row.params = g[0].params;
  row.maglevCompiles = tr.maglevCompiles ?? null;
  row.turbofanCompiles = tr.turbofanCompiles ?? null;
  row.deopts = tr.deopts ?? null;
  row.markingsHotABC = tr.markingsHotABC ?? null;
  row.alwaysTurbofanLines = tr.alwaysTurbofanLines ?? null;
  if (errors[k]) row.partialErrors = errors[k].length;
  out.push(row);
}
fs.writeFileSync(path.join(__dirname, 'results.jsonl'), out.map(o => JSON.stringify(o)).join('\n') + '\n');
console.log('cells:', out.length, '| cells with errors:', Object.keys(errors).length);
for (const k of Object.keys(errors)) console.log('ERROR', k, errors[k][0].slice(0, 200));
