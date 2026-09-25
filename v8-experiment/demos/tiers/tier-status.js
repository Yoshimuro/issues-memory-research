'use strict';
// tier-status.js — библиотека + CLI: в каком тире (Ignition / Sparkplug / Maglev / TurboFan)
// сейчас живёт функция. Источник битов: V8 src/runtime/runtime.h, enum OptimizationStatus.
//
// Библиотека:  const { decodeOptimizationStatus, tierOf, getStatusFn } = require('./tier-status');
// CLI:         node [--allow-natives-syntax] [v8-flags] tier-status.js
//   Без --allow-natives-syntax CLI сам включит флаг через v8.setFlagsFromString (способ (b)).

const BITS = [
  'IsFunction',                              // 0
  'NeverOptimize',                           // 1
  'AlwaysOptimize',                          // 2
  'MaybeDeopted',                            // 3
  'Optimized',                               // 4
  'MaglevOptimized',                         // 5
  'TurboFanned',                             // 6
  'Interpreted',                             // 7
  'MarkedForOptimization',                   // 8
  'MarkedForConcurrentOptimization',         // 9
  'OptimizingConcurrently',                  // 10
  'IsExecuting',                             // 11
  'TopmostFrameIsTurboFanned',               // 12
  'LiteMode',                                // 13
  'MarkedForDeoptimization',                 // 14
  'Baseline',                                // 15
  'TopmostFrameIsInterpreted',               // 16
  'TopmostFrameIsBaseline',                  // 17
  'IsLazy',                                  // 18
  'TopmostFrameIsMaglev',                    // 19
  'OptimizeOnNextCallOptimizesToMaglev',     // 20
  'OptimizeMaglevOptimizesToTurbofan',       // 21
  'MarkedForMaglevOptimization',             // 22
  'MarkedForConcurrentMaglevOptimization',   // 23
];

function decodeOptimizationStatus(status) {
  const out = [];
  for (let i = 0; i < BITS.length; i++) if (status & (1 << i)) out.push(BITS[i]);
  return out;
}

function tierOf(status) {
  const has = i => (status & (1 << i)) !== 0;
  if (!has(0)) return 'not-a-function';
  if (has(18)) return 'lazy(not compiled)';
  if (has(6)) return 'turbofan';
  if (has(5)) return 'maglev';
  if (has(4)) return 'turbofan'; // Optimized без уточнения (старые V8) — считаем TurboFan
  if (has(8) || has(9) || has(10) || has(22) || has(23)) return 'pending';
  if (has(15)) return 'baseline';
  if (has(7)) return 'interpreted';
  // Внутри выполняющейся функции код-объект мог быть уже заменён; смотрим на верхний кадр.
  const f = frameTierOf(status);
  return f === '-' ? 'unknown(' + status + ')' : f;
}

// Тир ВЕРХНЕГО КАДРА (имеет смысл только когда IsExecuting, т.е. статус запрошен
// изнутри самой функции — так видно OSR).
function frameTierOf(status) {
  const has = i => (status & (1 << i)) !== 0;
  if (has(12)) return 'turbofan';
  if (has(19)) return 'maglev';
  if (has(17)) return 'baseline';
  if (has(16)) return 'interpreted';
  return '-';
}

// Способ (a): процесс запущен с --allow-natives-syntax -> `%` парсится сразу.
// Способ (b): в рантайме включить флаг и СОЗДАТЬ НОВЫЙ КОД (new Function / eval) —
// уже распарсенный код флаг не подхватит, но новый парсинг видит его.
function getStatusFn() {
  const mk = () => new Function('f', 'return %GetOptimizationStatus(f)');
  try { return { fn: mk(), how: 'a:cmdline --allow-natives-syntax' }; }
  catch (e) {
    require('v8').setFlagsFromString('--allow-natives-syntax');
    return { fn: mk(), how: 'b:runtime v8.setFlagsFromString + new Function' };
  }
}

module.exports = { BITS, decodeOptimizationStatus, tierOf, frameTierOf, getStatusFn };

// ---------------------------------------------------------------- CLI
if (require.main === module) (async () => {
  const { fn: status, how } = getStatusFn();
  const nat = src => new Function(src); // после включения флага любой new Function видит %-синтаксис
  const v8flags = process.execArgv.filter(a => a.startsWith('--')).join(' ') || '(default)';
  console.log(`node ${process.version} / V8 ${process.versions.v8} / flags: ${v8flags}`);
  console.log(`natives через: ${how}`);

  // Горячая функция: загрузки свойств одной формы + арифметика (~20 байткодов).
  function hot(o) { return o.a * o.b + o.c - o.d + o.e; }
  const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };

  const fmt = s => `${String(s).padStart(8)}  ${tierOf(s).padEnd(20)} ${frameTierOf(s).padEnd(12)} 0b${s.toString(2).padStart(24, '0')}  ${decodeOptimizationStatus(s).join('|')}`;
  const samples = [1, 2, 7, 8, 9, 50, 100, 200, 399, 400, 401, 600, 1000, 2000, 2999, 3000, 3001, 4000, 6000, 10000, 20000];
  console.log(`\n== hot(o): статус после N-го вызова (без пауз между вызовами)`);
  console.log(`  ${'N'.padStart(6)}  ${'raw'.padStart(8)}  ${'tier'.padEnd(20)} ${'frame'.padEnd(12)} bits`);
  console.log(`  ${'0'.padStart(6)}  ${fmt(status(hot))}`);
  let acc = 0, n = 0;
  for (const target of samples) {
    while (n < target) { acc += hot(obj); n++; }
    console.log(`  ${String(n).padStart(6)}  ${fmt(status(hot))}`);
  }
  // Даём фоновому компилятору доустановить код: несколько тиков setImmediate + ещё вызовы.
  for (let k = 0; k < 5; k++) await new Promise(r => setImmediate(r));
  console.log(`  after 5x setImmediate, no calls:`);
  console.log(`  ${String(n).padStart(6)}  ${fmt(status(hot))}`);
  for (let i = 0; i < 100; i++) { acc += hot(obj); n++; }
  console.log(`  after 5x setImmediate + 100 calls:`);
  console.log(`  ${String(n).padStart(6)}  ${fmt(status(hot))}`);
  for (let k = 0; k < 20; k++) await new Promise(r => setImmediate(r));
  for (let i = 0; i < 100; i++) { acc += hot(obj); n++; }
  console.log(`  after 20x setImmediate + 100 calls:`);
  console.log(`  ${String(n).padStart(6)}  ${fmt(status(hot))}`);
  // Фоновый TurboFan может занять единицы-десятки мс: ждём по таймеру и снова вызываем.
  for (const ms of [20, 100, 300]) {
    await new Promise(r => setTimeout(r, ms));
    for (let i = 0; i < 100; i++) { acc += hot(obj); n++; }
    console.log(`  after setTimeout(${ms}) + 100 calls:`);
    console.log(`  ${String(n).padStart(6)}  ${fmt(status(hot))}`);
  }
  if (acc === 42) console.log(acc); // не даём выкинуть acc

  // Функция, которая вызвана один раз — остаётся в интерпретаторе (или lazy до первого вызова).
  function once(o) { return o.a + o.e; }
  console.log(`\n== once(o): до вызова   ${fmt(status(once))}`);
  once(obj);
  console.log(`== once(o): после 1 вызова ${fmt(status(once))}`);

  // OSR: длинный цикл внутри ОДНОГО вызова. Статус самой функции запрашиваем изнутри цикла —
  // биты TopmostFrameIs* показывают, в каком тире выполняется текущий кадр.
  const osrDemo = nat(`
    const S = arguments[0]; const log = arguments[1];
    function loopy(o) {
      let s = 0;
      for (let i = 0; i < 3000000; i++) {
        s += o.a * i + o.b;
        if (i === 0 || i === 100 || i === 10000 || i === 100000 || i === 500000 || i === 1000000 || i === 2000000 || i === 2999999) {
          log(i, %GetOptimizationStatus(loopy));
        }
      }
      return s;
    }
    return loopy;
  `);
  console.log(`\n== loopy(o): OSR — статус изнутри цикла (i -> tier -> bits)`);
  const loopy = osrDemo(status, (i, s) => console.log(`  i=${String(i).padStart(8)}  ${fmt(s)}`));
  loopy(obj);
  console.log(`== loopy(o): после выхода     ${fmt(status(loopy))}`);
})();
