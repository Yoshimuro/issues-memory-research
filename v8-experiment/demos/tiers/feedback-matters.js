'use strict';
// feedback-matters.js — механизм за Q2: оптимизирующий компилятор без feedback vs с feedback.
// Родитель запускает детей: node --allow-natives-syntax --trace-deopt feedback-matters.js child <tier> <variant>
//   tier:    turbofan | maglev
//   variant: empty        (0 прогревочных вызовов, %PrepareFunctionForOptimization + %OptimizeXOnNextCall)
//            warm         (200 прогревочных вызовов на стабильной форме, потом то же)
//            empty-always (как empty, но ребёнок запущен с --always-turbofan: TurboFan компилирует пустой
//                          feedback БЕЗ bailout_on_uninitialized -> generic-код без деопта; только tier=turbofan)
// Ребёнок печатает JSON-строку + (в stdout же) строки --trace-deopt; родитель считает 'reason:'.
const { spawnSync } = require('child_process');
const { decodeOptimizationStatus, tierOf } = require('./tier-status');

if (process.argv[2] === 'child') {
  const tier = process.argv[3], variant = process.argv[4];
  const nat = new Function('f', 'op', `
    if (op === 'prepare') %PrepareFunctionForOptimization(f);
    else if (op === 'tf') %OptimizeFunctionOnNextCall(f);
    else if (op === 'maglev') %OptimizeMaglevOnNextCall(f);
    else if (op === 'status') return %GetOptimizationStatus(f);
  `);
  // Функция с несколькими IC-сайтами: загрузки свойств, арифметика, вызов метода, доступ к массиву.
  function target(o, arr, i) { return o.a * o.b + o.c + arr[i & 7] + o.s.length; }
  const obj = { a: 1, b: 2, c: 3, s: 'xyz' };
  const arr = [1, 2, 3, 4, 5, 6, 7, 8];
  let acc = 0;
  nat(target, 'prepare');
  const warm = variant === 'warm' ? 200 : 0;
  for (let i = 0; i < warm; i++) acc += target(obj, arr, i);
  const statusBefore = nat(target, 'status');
  nat(target, tier === 'maglev' ? 'maglev' : 'tf');
  const tOpt0 = performance.now();
  acc += target(obj, arr, 0); // здесь происходит синхронная компиляция
  const optMs = performance.now() - tOpt0;
  const statusAfterFirst = nat(target, 'status');
  const tK0 = performance.now();
  for (let i = 0; i < 2000; i++) acc += target(obj, arr, i);
  const first2000Ms = performance.now() - tK0;
  const statusAfter2000 = nat(target, 'status');
  const t0 = performance.now();
  for (let i = 0; i < 1e6; i++) acc += target(obj, arr, i);
  const runMs = performance.now() - t0;
  const statusEnd = nat(target, 'status');
  console.log(JSON.stringify({
    tier, variant, warm, node: process.version,
    statusBefore: decodeOptimizationStatus(statusBefore),
    statusAfterFirst: decodeOptimizationStatus(statusAfterFirst), tierAfterFirst: tierOf(statusAfterFirst),
    statusAfter2000: decodeOptimizationStatus(statusAfter2000), tierAfter2000: tierOf(statusAfter2000),
    first2000Ms: +first2000Ms.toFixed(3),
    statusEnd: decodeOptimizationStatus(statusEnd), tierEnd: tierOf(statusEnd),
    maybeDeopted: (statusEnd & 8) !== 0,
    optCompileMs: +optMs.toFixed(3),
    run1e6Ms: +runMs.toFixed(2), callsPerMs: +(1e6 / runMs).toFixed(0), acc,
  }));
  process.exit(0);
}

const tiers = process.argv[2] ? [process.argv[2]] : ['turbofan', 'maglev'];
console.log(`node ${process.version} / V8 ${process.versions.v8}`);
for (const tier of tiers) {
  for (const variant of (tier === 'turbofan' ? ['empty', 'warm', 'empty-always'] : ['empty', 'warm'])) {
    const extra = variant === 'empty-always' ? ['--always-turbofan'] : [];
    const r = spawnSync(process.execPath, ['--allow-natives-syntax', '--trace-deopt', ...extra, __filename, 'child', tier, variant], { encoding: 'utf8' });
    const out = (r.stdout || '') + (r.stderr || '');
    const json = out.split('\n').find(l => l.startsWith('{'));
    const reasons = out.split('\n').filter(l => /reason:/.test(l) && /JSFunction target/.test(l));
    const deoptLines = out.split('\n').filter(l => /bailout \(kind/.test(l) && /JSFunction target/.test(l));
    console.log(`\n== tier=${tier} variant=${variant} (child flags: --allow-natives-syntax --trace-deopt${extra.map(f => ' ' + f).join('')}; exit ${r.status})`);
    if (!json) { console.log('  no JSON output; output head:', out.slice(0, 500).trim()); continue; }
    const notEnabled = out.split('\n').filter(l => /not enabled|not supported|bad option/i.test(l));
    for (const l of notEnabled.slice(0, 3)) console.log('  V8 сообщил: ' + l.trim().slice(0, 160));
    const j = JSON.parse(json);
    console.log(`  warm-up calls: ${j.warm}  | status before opt: ${j.statusBefore.join('|')}`);
    console.log(`  after 1st call: ${j.tierAfterFirst.padEnd(12)} ${j.statusAfterFirst.join('|')}  (sync compile ${j.optCompileMs} ms)`);
    console.log(`  after 2000 more calls: ${j.tierAfter2000.padEnd(11)} ${j.statusAfter2000.join('|')}  (first 2000 calls took ${j.first2000Ms} ms)`);
    console.log(`  after 1e6 calls: ${j.tierEnd.padEnd(11)} ${j.statusEnd.join('|')}  MaybeDeopted=${j.maybeDeopted}`);
    console.log(`  1e6 calls: ${j.run1e6Ms} ms  (${j.callsPerMs} calls/ms)`);
    console.log(`  --trace-deopt bailout lines for target: ${deoptLines.length}; reason lines:`);
    for (const l of reasons.slice(0, 8)) console.log('    ' + l.trim().slice(0, 200));
  }
}
