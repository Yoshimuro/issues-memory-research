// Accumulator init 0 vs -0: first calls add ints (SMI feedback), later calls add doubles
const log = typeof print === 'function' ? print : console.log;
const mode = (typeof process !== 'undefined') ? process.argv[2] : (typeof arguments !== 'undefined' ? arguments[0] : 'zero');
function sumZero(n, step) { let s = 0; for (let i = 0; i < n; i++) s += step; return s; }
function sumNegZero(n, step) { let s = -0; for (let i = 0; i < n; i++) s += step; return s; }
const f = mode === 'neg' ? sumNegZero : sumZero;
let t = Date.now(), r = 0;
for (let k = 0; k < 20000; k++) r += f(1000, 1);
const t1 = Date.now() - t; t = Date.now();
for (let k = 0; k < 20000; k++) r += f(1000, 0.5);
const t2 = Date.now() - t;
log(`${mode}: ints ${t1} ms, doubles ${t2} ms, total ${t1+t2} ms`);
