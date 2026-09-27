// Sum loop / reduce over TypedArray vs regular packed arrays; same process, alternating, 5 rounds
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const N = 1e6, R = 50;
const smi = []; for (let i = 0; i < N; i++) smi.push(i & 127);
const dbl = []; for (let i = 0; i < N; i++) dbl.push((i & 127) + 0.5);
const i32 = new Int32Array(N); for (let i = 0; i < N; i++) i32[i] = i & 127;
const i8 = new Int8Array(N); for (let i = 0; i < N; i++) i8[i] = i & 127;
const f64 = new Float64Array(N); for (let i = 0; i < N; i++) f64[i] = (i & 127) + 0.5;
function sumLoop(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumLoopI(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) | 0; return s; }
const add = (x, y) => x + y;
function sumReduce(a) { return a.reduce(add, 0); }
const cases = { 'loop smi[]': () => sumLoopI(smi), 'loop Int32Array': () => sumLoopI(i32), 'loop Int8Array': () => sumLoopI(i8),
  'loop double[]': () => sumLoop(dbl), 'loop Float64Array': () => sumLoop(f64),
  'reduce smi[]': () => sumReduce(smi), 'reduce Int8Array': () => sumReduce(i8), 'reduce Int32Array': () => sumReduce(i32) };
for (const k in cases) for (let r = 0; r < 5; r++) cases[k]();
for (let round = 0; round < 3; round++) {
  const out = [];
  for (const k in cases) { const t0 = now(); for (let r = 0; r < R; r++) cases[k](); out.push(k + '=' + (now() - t0).toFixed(0)); }
  log('round ' + round + ': ' + out.join('  '));
}
