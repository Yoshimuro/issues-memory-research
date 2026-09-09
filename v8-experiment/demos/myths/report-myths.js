'use strict';
// results.jsonl -> markdown-таблицы: абсолюты+ratio по бенчам и сводная ratio-матрица.
const fs = require('fs');
const path = require('path');
const rows = fs.readFileSync(path.join(__dirname, 'results.jsonl'), 'utf8')
  .trim().split('\n').map(JSON.parse);

const RUNTIMES = ['node20', 'node22', 'node24', 'd8'];
const BASE = { ic: '1-shapes', elements: 'SMI', delete: 'fast' };
// trycatch: у каждой пары своя база
const tcBase = c => c === 'naive-try' ? 'naive-plain' : c === 'honest-try' ? 'honest-plain' : null;

const get = (rt, bench, cs) => rows.find(r => r.runtime === rt && r.bench === bench && r.case === cs);

const CASES = {
  ic: ['1-shapes', '2-shapes', '4-shapes', '8-shapes'],
  elements: ['SMI', 'DOUBLE', 'HOLEY', 'ELEMENTS'],
  delete: ['fast', 'delete', 'undefined'],
  trycatch: ['naive-plain', 'naive-try', 'honest-plain', 'honest-try'],
};

const ratioOf = (rt, bench, cs) => {
  const baseCase = bench === 'trycatch' ? (tcBase(cs) || cs) : BASE[bench];
  const r = get(rt, bench, cs), b = get(rt, bench, baseCase);
  if (!r || !b) return null;
  return r.ms / b.ms;
};

for (const [bench, cases] of Object.entries(CASES)) {
  console.log(`\n### ${bench}\n`);
  console.log('| case | ' + RUNTIMES.map(rt => `${rt} ms | ${rt} ×`).join(' | ') + ' |');
  console.log('|---' + '|---:'.repeat(RUNTIMES.length * 2) + '|');
  for (const cs of cases) {
    const cells = RUNTIMES.map(rt => {
      const r = get(rt, bench, cs), x = ratioOf(rt, bench, cs);
      return r ? `${r.ms} | ×${x.toFixed(2)}` : '— | —';
    });
    console.log(`| ${cs} | ${cells.join(' | ')} |`);
  }
}

console.log('\n### СВОДНАЯ: только ratio (инвариантность кратностей)\n');
console.log('| bench/case | ' + RUNTIMES.join(' | ') + ' |');
console.log('|---' + '|---:'.repeat(RUNTIMES.length) + '|');
for (const [bench, cases] of Object.entries(CASES)) {
  for (const cs of cases) {
    if (bench !== 'trycatch' && cs === BASE[bench]) continue;
    if (bench === 'trycatch' && !tcBase(cs)) continue;
    const label = bench === 'trycatch' ? `${bench}/${cs} vs ${tcBase(cs)}` : `${bench}/${cs}`;
    const cells = RUNTIMES.map(rt => { const x = ratioOf(rt, bench, cs); return x ? '×' + x.toFixed(2) : '—'; });
    console.log(`| ${label} | ${cells.join(' | ')} |`);
  }
}

console.log('\n### разброс повторов (max-min, мс) — контроль шума\n');
const noisy = rows.filter(r => r.spread > r.ms * 0.2);
console.log('ячеек с разбросом >20% медианы:', noisy.length, 'из', rows.length);
noisy.slice(0, 10).forEach(r => console.log(' ', JSON.stringify(r)));
