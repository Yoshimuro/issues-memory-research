'use strict';
// results.jsonl -> markdown-таблицы по рантаймам: медианы + [min–max] по повторам + ratio к default.
const fs = require('fs');
const path = require('path');
const rows = fs.readFileSync(path.join(__dirname, 'results.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const RUNTIMES = [...new Set(rows.map(r => r.runtime))];
const x = (a, b) => (a != null && b) ? '×' + (a / b).toFixed(2) : '—';
const n = (v, d = 1) => v == null ? '—' : (+v).toFixed(d);
const k = v => v == null ? '—' : (v / 1000).toFixed(0) + 'k';

for (const rt of RUNTIMES) {
  const rs = rows.filter(r => r.runtime === rt);
  const base = rs.find(r => r.variant === 'default');
  const p = base.params;
  console.log(`\n### ${rt} (N_COLD=${p.N_COLD}, HOT_MS=${p.HOT_MS}, UNSTABLE_N=${p.UNSTABLE_N}; медианы ${base.reps} процессов, в скобках min–max по повторам)\n`);
  console.log('| variant | cold ms | × | hot steady it/ms | × | 1st window | unstable ms | × | rss MB | code KB | compiles M/TF | deopts (trace) | harness deopts/rep | gc hot |');
  console.log('|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|');
  for (const r of rs) {
    if (r.error) { console.log(`| ${r.variant} | ОШИБКА: ${r.error.slice(0, 80)} |`); continue; }
    console.log(`| ${r.variant} | ${n(r.coldMs)} (${n(r.coldMin, 0)}–${n(r.coldMax, 0)}) | ${x(r.coldMs, base.coldMs)} | ${k(r.hotSteadyPerMs)} (${k(r.hotSteadyMin)}–${k(r.hotSteadyMax)}) | ${x(r.hotSteadyPerMs, base.hotSteadyPerMs)} | ${k(r.hotFirstWindowPerMs)} | ${n(r.unstableMs, 1)} | ${x(r.unstableMs, base.unstableMs)} | ${n(r.rssMB)} | ${n(r.codeKB, 0)} | ${r.maglevCompiles ?? '—'}/${r.turbofanCompiles ?? '—'} | ${r.deopts ?? '—'} | ${n(r.deoptsHotHarnessRep, 0)} | ${n(r.gcHot, 0)} |`);
  }
  console.log(`\nдетали cold (create / call) и unstable (первая / вторая половина каждой подфазы), ${rt}:\n`);
  console.log('| variant | cold create ms | cold call ms | unst A h1/h2 ms | B h1/h2 | mix h1/h2 | heapUsed MB | bytecode KB | hot iters | hot steady по повторам, k it/ms |');
  console.log('|---|--:|--:|--:|--:|--:|--:|--:|--:|---|');
  for (const r of rs) {
    if (r.error) continue;
    console.log(`| ${r.variant} | ${n(r.coldCreateMs)} | ${n(r.coldCallMs)} | ${n(r.unstableA1Ms, 1)}/${n(r.unstableA2Ms, 1)} | ${n(r.unstableB1Ms, 1)}/${n(r.unstableB2Ms, 1)} | ${n(r.unstableMix1Ms, 1)}/${n(r.unstableMix2Ms, 1)} | ${n(r.heapUsedMB)} | ${n(r.bytecodeKB, 0)} | ${r.hotIters} | ${r.hotSteadyAll.join(' ')} |`);
  }
}

console.log('\n### СВОДНАЯ: ratio к default (cold ms / hot steady / unstable ms)\n');
const VARS = [...new Set(rows.map(r => r.variant))];
console.log('| variant | ' + RUNTIMES.map(rt => `${rt} cold | ${rt} hot | ${rt} unst`).join(' | ') + ' |');
console.log('|---' + '|--:'.repeat(RUNTIMES.length * 3) + '|');
for (const v of VARS) {
  if (v === 'default') continue;
  const cells = RUNTIMES.map(rt => {
    const r = rows.find(q => q.runtime === rt && q.variant === v), b = rows.find(q => q.runtime === rt && q.variant === 'default');
    if (!r) return 'n/a | n/a | n/a';
    if (r.error) return 'ERR | ERR | ERR';
    return `${x(r.coldMs, b.coldMs)} | ${x(r.hotSteadyPerMs, b.hotSteadyPerMs)} | ${x(r.unstableMs, b.unstableMs)}`;
  });
  console.log(`| ${v} | ${cells.join(' | ')} |`);
}

console.log('\n### разброс повторов — контроль шума\n');
const noisy = rows.filter(r => !r.error && (r.coldSpread > r.coldMs * 0.2 || r.hotSteadySpread > r.hotSteadyPerMs * 0.2));
console.log('ячеек с разбросом (max−min) >20% медианы (cold или hot steady):', noisy.length, 'из', rows.filter(r => !r.error).length);
noisy.forEach(r => console.log(`  ${r.runtime}/${r.variant}: cold ${r.coldMs} (${r.coldMin}–${r.coldMax}), hot steady ${r.hotSteadyPerMs} (${r.hotSteadyMin}–${r.hotSteadyMax}); hot по повторам: ${r.hotSteadyAll.join(' ')}`));
