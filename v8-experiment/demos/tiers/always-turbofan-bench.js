'use strict';
// always-turbofan-bench.js — «почему бы не компилировать сразу TurboFan?»
// Один процесс = один вариант флагов (флаги задаёт раннер run-matrix.sh). Печатает одну JSON-строку.
// Три фазы, у каждой СВОЯ функция-цикл (никакого общего bench(fn) — см. заражение харнесса в demos/myths).
//   cold:     N разных функций (new Function с индексом внутри), каждая вызвана ровно 3 раза.
//   hot:      3 моно-функции, вызываемые из chunk() с меняющимися входами, ~HOT_MS мс, окна по 25 мс.
//   unstable: одна функция: N × форма A, N × форма B (добавлено поле), N × вперемешку; каждая подфаза — две половины.
//
// Правки харнеса после ревью (v2):
//   - аккумулятор hot-фазы — Smi (`(s + x) & 0x3fffffff`), а не double: double-аккумулятор в OSR-коде
//     боксился в HeapNumber на каждой итерации (~1170 scavenge за 800 мс, ~10% времени в GC);
//   - входы hotA/hotB/hotC меняются каждую итерацию (4 объекта одной формы, индекс от k), чтобы
//     вызовы нельзя было вынести из цикла как loop-invariant (так родился «turbolev ×3.3»);
//   - горячий цикл — обычная функция chunk(), вызываемая ~75 000 раз (tier-up по числу вызовов),
//     now()/push окон — снаружи, а не в OSR-коде; hotA/B/C при этом инлайнятся в chunk — это
//     заявлено явно: «hot» измеряет chunk+hotA/B/C в тире, до которого дошёл chunk;
//   - метрика «steady» = медиана окон последней трети фазы (а не «5 лучших окон»);
//   - GC-события считаются по фазам через PerformanceObserver('gc');
//   - UNSTABLE_N по умолчанию 200000 (при 20000 фаза длилась 1–3 мс и измеряла переходный процесс).
const v8 = require('v8');
const { PerformanceObserver } = require('perf_hooks');
const now = () => performance.now();
const N_COLD = +(process.env.N_COLD || 2000);
const HOT_MS = +(process.env.HOT_MS || 1500);
const UNSTABLE_N = +(process.env.UNSTABLE_N || 200000);
const WINDOW_MS = 25;
const CHUNK = 2000;
const VARIANT = process.env.VARIANT || 'default';

let gcCount = 0;
const gcObs = new PerformanceObserver(list => { gcCount += list.getEntries().length; });
gcObs.observe({ entryTypes: ['gc'] });
const tick = () => new Promise(r => setImmediate(r)); // даём observer'у доставить накопившиеся gc-записи

// ---------------- cold
function makeColdFn(i) {
  return new Function('o',
    `let s = ${i}; for (let k = 0; k < 10; k++) { s += o.a * o.b + o.c + k * ${(i % 7) + 1}; } return s + o.d - ${i};`);
}
function coldPhase() {
  const obj = { a: 1, b: 2, c: 3, d: 4 };
  const fns = new Array(N_COLD);
  const tCreate0 = now();
  for (let i = 0; i < N_COLD; i++) fns[i] = makeColdFn(i);
  const createMs = now() - tCreate0;
  let acc = 0;
  const tCall0 = now();
  for (let i = 0; i < N_COLD; i++) { const f = fns[i]; acc += f(obj); acc += f(obj); acc += f(obj); }
  const callMs = now() - tCall0;
  return { coldCreateMs: +createMs.toFixed(2), coldCallMs: +callMs.toFixed(2), coldMs: +(createMs + callMs).toFixed(2), coldAcc: acc };
}

// ---------------- hot
function hotA(o) { return o.a * o.b + o.c - o.d + o.e; }
function hotB(o) { let s = 0; for (let k = 0; k < 4; k++) s += o.a * k + o.b; return s; }
function hotC(o) { return (o.a + o.b) * (o.c + o.d) + o.e; }
// n итераций; s — Smi-аккумулятор (маска 30 бит: всегда Smi, ни одной аллокации ни в одном тире).
function chunk(objs, s, n) {
  for (let k = 0; k < n; k++) {
    s = (s + hotA(objs[k & 3]) + hotB(objs[(k + 1) & 3]) + hotC(objs[(k + 2) & 3])) & 0x3fffffff;
  }
  return s;
}
const med = a => { const b = [...a].sort((x, y) => x - y); return b[b.length >> 1]; };
function hotPhase() {
  const objs = [
    { a: 1, b: 2, c: 3, d: 4, e: 5 }, { a: 2, b: 3, c: 4, d: 5, e: 6 },
    { a: 3, b: 4, c: 5, d: 6, e: 7 }, { a: 4, b: 5, c: 6, d: 7, e: 8 },
  ];
  const windows = []; // it/ms по окнам ~WINDOW_MS
  const ends = [];
  const t0 = now();
  let wStart = t0, wIters = 0, total = 0, s = 0;
  for (;;) {
    s = chunk(objs, s, CHUNK);
    wIters += CHUNK; total += CHUNK;
    const t = now();
    if (t - wStart >= WINDOW_MS) { windows.push(wIters / (t - wStart)); ends.push(t - t0); wIters = 0; wStart = t; }
    if (t - t0 >= HOT_MS) break;
  }
  const lastThird = windows.slice(Math.floor(windows.length * 2 / 3));
  const steady = med(lastThird);
  const sorted = [...windows].sort((a, b) => b - a);
  const peak = med(sorted.slice(0, 5));
  const i90 = windows.findIndex(w => w >= 0.9 * steady);
  return {
    hotIters: total,
    hotWindows: windows.length,
    hotSteadyPerMs: +steady.toFixed(1),          // медиана окон последней трети — основная метрика
    hotSteadyMinPerMs: +Math.min(...lastThird).toFixed(1),
    hotSteadyMaxPerMs: +Math.max(...lastThird).toFixed(1),
    hotPeakPerMs: +peak.toFixed(1),              // медиана 5 лучших окон (старая метрика, для сравнения)
    hotFirstWindowPerMs: +windows[0].toFixed(1),
    hotTimeTo90Ms: i90 >= 0 ? +ends[i90].toFixed(1) : null, // первое окно ≥ 0.9·steady (квантовано по 25 мс)
    hotSeries: windows.map(w => Math.round(w / 100)), // it/ms ÷ 100, по окнам — для анализа мод
    hotAcc: s,
  };
}

// ---------------- unstable
function unstable(o) { let s = 0; for (let k = 0; k < 6; k++) s += o.p * k + o.q - o.r; return s; }
function unstablePhase() {
  const A = { p: 1, q: 2, r: 3 };
  const B = { p: 1, q: 2, r: 3 }; B.extra = 4; // та же «база», но добавлено поле -> другая форма
  const half = UNSTABLE_N >> 1;
  let acc = 0;
  const t = [now()];
  for (let i = 0; i < half; i++) acc += unstable(A); t.push(now());
  for (let i = half; i < UNSTABLE_N; i++) acc += unstable(A); t.push(now());
  for (let i = 0; i < half; i++) acc += unstable(B); t.push(now());
  for (let i = half; i < UNSTABLE_N; i++) acc += unstable(B); t.push(now());
  for (let i = 0; i < half; i++) acc += unstable(i & 1 ? A : B); t.push(now());
  for (let i = half; i < UNSTABLE_N; i++) acc += unstable(i & 1 ? A : B); t.push(now());
  const d = i => +(t[i + 1] - t[i]).toFixed(2);
  return {
    unstableA1Ms: d(0), unstableA2Ms: d(1), unstableB1Ms: d(2), unstableB2Ms: d(3), unstableMix1Ms: d(4), unstableMix2Ms: d(5),
    unstableAMs: +(t[2] - t[0]).toFixed(2), unstableBMs: +(t[4] - t[2]).toFixed(2), unstableMixMs: +(t[6] - t[4]).toFixed(2),
    unstableMs: +(t[6] - t[0]).toFixed(2), unstableAcc: acc,
  };
}

(async () => {
  await tick(); const gc0 = gcCount;
  const cold = coldPhase();
  await tick(); const gc1 = gcCount;
  const hot = hotPhase();
  await tick(); const gc2 = gcCount;
  const unst = unstablePhase();
  await tick(); const gc3 = gcCount;
  const mem = process.memoryUsage();
  const code = v8.getHeapCodeStatistics();
  console.log(JSON.stringify({
    variant: VARIANT, node: process.version, v8: process.versions.v8,
    params: { N_COLD, HOT_MS, UNSTABLE_N, CHUNK },
    ...cold, ...hot, ...unst,
    gcCold: gc1 - gc0, gcHot: gc2 - gc1, gcUnstable: gc3 - gc2,
    rssMB: +(mem.rss / 1048576).toFixed(1),
    heapUsedMB: +(mem.heapUsed / 1048576).toFixed(1),
    codeKB: +(code.code_and_metadata_size / 1024).toFixed(0),
    bytecodeKB: +(code.bytecode_and_metadata_size / 1024).toFixed(0),
  }));
})();
