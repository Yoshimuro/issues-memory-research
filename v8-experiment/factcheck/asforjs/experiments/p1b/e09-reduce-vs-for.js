// reduce vs for, push vs index-write, compared inside one process back-to-back, per tier (--max-opt).
const log = typeof console !== 'undefined' ? console.log : print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const arr = Array.from({ length: 1000 }, (_, i) => i);
function sumReduce(a) { return a.reduce((s, x) => s + x, 0); }
function sumFor(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function fillPush(n) { const a = []; for (let i = 0; i < n; i++) a.push(i); return a; }
function fillIndex(n) { const a = []; for (let i = 0; i < n; i++) a[i] = i; return a; }
function bench(name, f, arg, reps) { let t = now(), x = 0; for (let k = 0; k < reps; k++) { const r = f(arg); x += typeof r === 'number' ? r : r.length; } return now() - t; }
const R = 20000;
for (let round = 0; round < 3; round++) {
  const tr = bench('reduce', sumReduce, arr, R), tf = bench('for', sumFor, arr, R);
  const tp = bench('push', fillPush, 1000, R), ti = bench('index', fillIndex, 1000, R);
  log(`round${round} reduce=${tr.toFixed(0)}ms for=${tf.toFixed(0)}ms ratio=${(tr / tf).toFixed(2)} | push=${tp.toFixed(0)}ms index=${ti.toFixed(0)}ms push/index=${(tp / ti).toFixed(2)}`);
}
