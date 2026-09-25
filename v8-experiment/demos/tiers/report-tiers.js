'use strict';
// results.jsonl -> markdown-таблицы по рантаймам: абсолюты + ratio к default.
const fs = require('fs');
const path = require('path');
const rows = fs.readFileSync(path.join(__dirname, 'results.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
const RUNTIMES = [...new Set(rows.map(r => r.runtime))];
const x = (a, b) => (a != null && b) ? '×' + (a / b).toFixed(2) : '—';
const n = (v, d = 1) => v == null ? '—' : (+v).toFixed(d);

for (const rt of RUNTIMES) {
  const rs = rows.filter(r => r.runtime === rt);
  const base = rs.find(r => r.variant === 'default');
  const p = base.params;
  console.log(`\n### ${rt} (N_COLD=${p.N_COLD}, HOT_MS=${p.HOT_MS}, UNSTABLE_N=${p.UNSTABLE_N}; медианы ${base.reps} процессов)\n`);
  console.log('| variant | cold ms | × | hot peak it/ms | × | 1st window it/ms | t90 ms | unstable ms | × | rss MB | code KB | compiles M/TF | deopts |');
  console.log('|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|');
  for (const r of rs) {
    if (r.error) { console.log(`| ${r.variant} | ОШИБКА: ${r.error.slice(0, 80)} |`); continue; }
    console.log(`| ${r.variant} | ${n(r.coldMs)} | ${x(r.coldMs, base.coldMs)} | ${n(r.hotPeakPerMs, 0)} | ${x(r.hotPeakPerMs, base.hotPeakPerMs)} | ${n(r.hotFirstWindowPerMs, 0)} | ${n(r.hotTimeTo90Ms, 0)} | ${n(r.unstableMs, 2)} | ${x(r.unstableMs, base.unstableMs)} | ${n(r.rssMB)} | ${n(r.codeKB, 0)} | ${r.maglevCompiles ?? '—'}/${r.turbofanCompiles ?? '—'} | ${r.deopts ?? '—'} |`);
  }
  console.log(`\nдетали cold (create / call) и unstable (A / B / mix), ${rt}:\n`);
  console.log('| variant | cold create ms | cold call ms | unstable A ms | B ms | mix ms | heapUsed MB | bytecode KB | hot iters |');
  console.log('|---|--:|--:|--:|--:|--:|--:|--:|--:|');
  for (const r of rs) {
    if (r.error) continue;
    console.log(`| ${r.variant} | ${n(r.coldCreateMs)} | ${n(r.coldCallMs)} | ${n(r.unstableAMs, 2)} | ${n(r.unstableBMs, 2)} | ${n(r.unstableMixMs, 2)} | ${n(r.heapUsedMB)} | ${n(r.bytecodeKB, 0)} | ${r.hotIters} |`);
  }
}

console.log('\n### СВОДНАЯ: ratio к default (cold ms / hot peak / unstable ms)\n');
const VARS = [...new Set(rows.map(r => r.variant))];
console.log('| variant | ' + RUNTIMES.map(rt => `${rt} cold | ${rt} hot | ${rt} unst`).join(' | ') + ' |');
console.log('|---' + '|--:'.repeat(RUNTIMES.length * 3) + '|');
for (const v of VARS) {
  if (v === 'default') continue;
  const cells = RUNTIMES.map(rt => {
    const r = rows.find(q => q.runtime === rt && q.variant === v), b = rows.find(q => q.runtime === rt && q.variant === 'default');
    if (!r) return 'n/a | n/a | n/a';
    if (r.error) return 'ERR | ERR | ERR';
    return `${x(r.coldMs, b.coldMs)} | ${x(r.hotPeakPerMs, b.hotPeakPerMs)} | ${x(r.unstableMs, b.unstableMs)}`;
  });
  console.log(`| ${v} | ${cells.join(' | ')} |`);
}

console.log('\n### разброс повторов — контроль шума\n');
const noisy = rows.filter(r => !r.error && (r.coldSpread > r.coldMs * 0.2 || r.hotPeakSpread > r.hotPeakPerMs * 0.2));
console.log('ячеек с разбросом >20% медианы (cold или hot peak):', noisy.length, 'из', rows.filter(r => !r.error).length);
noisy.forEach(r => console.log(`  ${r.runtime}/${r.variant}: cold ${r.coldMs}±${r.coldSpread}, hotPeak ${r.hotPeakPerMs}±${r.hotPeakSpread}`));
