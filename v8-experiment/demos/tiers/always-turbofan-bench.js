'use strict';
// always-turbofan-bench.js — «почему бы не компилировать сразу TurboFan?»
// Один процесс = один вариант флагов (флаги задаёт раннер run-matrix.sh). Печатает одну JSON-строку.
// Три фазы, у каждой СВОЯ функция-цикл (никакого общего bench(fn) — см. заражение харнесса в demos/myths).
//   cold:     N разных функций (new Function с индексом внутри), каждая вызвана ровно 3 раза.
//   hot:      3 моно-функции в цикле ~HOT_MS мс, пропускная способность по окнам 25 мс.
//   unstable: одна функция: 20000 × форма A, 20000 × форма B (добавлено поле), 20000 × вперемешку.
const v8 = require('v8');
const now = () => performance.now();
const N_COLD = +(process.env.N_COLD || 2000);
const HOT_MS = +(process.env.HOT_MS || 1500);
const UNSTABLE_N = +(process.env.UNSTABLE_N || 20000);
const WINDOW_MS = 25;
const VARIANT = process.env.VARIANT || 'default';

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
function hotPhase() {
  const oA = { a: 1, b: 2, c: 3, d: 4, e: 5 }, oB = { a: 2, b: 3, c: 4, d: 5, e: 6 }, oC = { a: 3, b: 4, c: 5, d: 6, e: 7 };
  const windows = [{ tEnd: 0, itersPerMs: 0 }]; // {tEnd, itersPerMs}; первый элемент — прогрев формы массива, удаляется ниже
  // acc сразу double (0.5), чтобы цикл-харнесс не деоптимизировался на переполнении Smi
  const t0 = now();
  let wStart = t0, wIters = 0, total = 0, acc = 0.5;
  for (;;) {
    for (let k = 0; k < 500; k++) acc += hotA(oA) + hotB(oB) + hotC(oC);
    wIters += 500; total += 500;
    const t = now();
    if (t - wStart >= WINDOW_MS) { windows.push({ tEnd: t - t0, itersPerMs: wIters / (t - wStart) }); wIters = 0; wStart = t; }
    if (t - t0 >= HOT_MS) break;
  }
  windows.shift();
  const sorted = windows.map(w => w.itersPerMs).sort((a, b) => b - a);
  const best5 = sorted.slice(0, 5);
  const peak = best5[best5.length >> 1];
  const w90 = windows.find(w => w.itersPerMs >= 0.9 * peak);
  return {
    hotIters: total,
    hotWindows: windows.length,
    hotPeakPerMs: +peak.toFixed(1),
    hotFirstWindowPerMs: +windows[0].itersPerMs.toFixed(1),
    hotTimeTo90Ms: w90 ? +w90.tEnd.toFixed(1) : null,
    hotAcc: acc,
  };
}

// ---------------- unstable
function unstable(o) { let s = 0; for (let k = 0; k < 6; k++) s += o.p * k + o.q - o.r; return s; }
function unstablePhase() {
  const A = { p: 1, q: 2, r: 3 };
  const B = { p: 1, q: 2, r: 3 }; B.extra = 4; // та же «база», но добавлено поле -> другая форма
  let acc = 0;
  const t0 = now();
  for (let i = 0; i < UNSTABLE_N; i++) acc += unstable(A);
  const tA = now();
  for (let i = 0; i < UNSTABLE_N; i++) acc += unstable(B);
  const tB = now();
  for (let i = 0; i < UNSTABLE_N; i++) acc += unstable(i & 1 ? A : B);
  const tM = now();
  return { unstableAMs: +(tA - t0).toFixed(2), unstableBMs: +(tB - tA).toFixed(2), unstableMixMs: +(tM - tB).toFixed(2), unstableMs: +(tM - t0).toFixed(2), unstableAcc: acc };
}

const cold = coldPhase();
const hot = hotPhase();
const unst = unstablePhase();
const mem = process.memoryUsage();
const code = v8.getHeapCodeStatistics();
console.log(JSON.stringify({
  variant: VARIANT, node: process.version, v8: process.versions.v8,
  params: { N_COLD, HOT_MS, UNSTABLE_N },
  ...cold, ...hot, ...unst,
  rssMB: +(mem.rss / 1048576).toFixed(1),
  heapUsedMB: +(mem.heapUsed / 1048576).toFixed(1),
  codeKB: +(code.code_and_metadata_size / 1024).toFixed(0),
  bytecodeKB: +(code.bytecode_and_metadata_size / 1024).toFixed(0),
}));
