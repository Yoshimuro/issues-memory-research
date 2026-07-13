'use strict';
// Свёртка results-real.jsonl: медиана 5 повторов на ячейку + отношения vs mono-llm.
const fs = require('fs');
const path = require('path');
const rows = fs.readFileSync(path.join(__dirname, 'results-real.jsonl'), 'utf8')
  .trim().split('\n').map(JSON.parse);

const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
const key = r => `${r.variant}|${r.batch}|${r.r}`;

const cells = {};
for (const r of rows) (cells[key(r)] = cells[key(r)] || []).push(r);

const METRICS = ['parse_ms', 'normalize_ms', 'consume_ms', 'serialize_ms', 'p50_total', 'p99_total'];
const agg = {};
for (const [k, reps] of Object.entries(cells)) {
  const a = { n_reps: reps.length };
  for (const m of METRICS) a[m] = med(reps.map(x => x[m]));
  // разброс повторов по total — для оценки шума
  const totals = reps.map(x => x.p50_total).sort((x, y) => x - y);
  a.total_min = totals[0]; a.total_max = totals[totals.length - 1];
  a.semanticSink = reps[0].semanticSink;
  agg[k] = a;
}

// проверка эквивалентности: semanticSink должен совпадать между вариантами при равных (B,R)
const sinkCheck = {};
for (const [k, a] of Object.entries(agg)) {
  const [v, b, r] = k.split('|');
  const kk = `${b}|${r}`;
  (sinkCheck[kk] = sinkCheck[kk] || new Set()).add(a.semanticSink);
}
const sinkOk = Object.values(sinkCheck).every(s => s.size === 1);

const out = [];
for (const b of [500, 5000]) for (const r of [1, 5, 20]) {
  const mono = agg[`mono-llm|${b}|${r}`];
  for (const v of ['mono-llm', 'guard-llm', 'mixed-mono']) {
    const a = agg[`${v}|${b}|${r}`];
    if (!a) continue;
    out.push({
      variant: v, batch: b, r,
      parse_ms: a.parse_ms, normalize_ms: a.normalize_ms,
      consume_ms: a.consume_ms, serialize_ms: a.serialize_ms,
      p50_total: a.p50_total, p99_total: a.p99_total,
      total_spread: +(a.total_max - a.total_min).toFixed(3),
      parse_share_pct: +(a.parse_ms / a.p50_total * 100).toFixed(1),
      x_total: +(a.p50_total / mono.p50_total).toFixed(3),
      x_consume: +(a.consume_ms / mono.consume_ms).toFixed(2),
      x_serialize: +(a.serialize_ms / mono.serialize_ms).toFixed(2),
      x_normalize: +(a.normalize_ms / mono.normalize_ms).toFixed(2),
      e2e_overhead_pct: +((a.p50_total / mono.p50_total - 1) * 100).toFixed(1),
    });
  }
}
console.log('semanticSink equal across variants per (B,R):', sinkOk);
console.table(out);
fs.writeFileSync(path.join(__dirname, 'agg.json'), JSON.stringify(out, null, 2));
