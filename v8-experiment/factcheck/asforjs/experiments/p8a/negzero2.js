// Accumulator init 0 vs -0: first calls get int-only data (SMI feedback), later calls doubles
const log = typeof print === 'function' ? print : console.log;
const mode = (typeof process !== 'undefined') ? process.argv[2] : 'zero';
const ints = []; for (let i = 0; i < 1000; i++) ints.push(i % 7);          // PACKED_SMI
const dbls = []; for (let i = 0; i < 1000; i++) dbls.push((i % 7) + 0.25); // PACKED_DOUBLE
function sumZero(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumNegZero(a) { let s = -0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
const f = mode === 'neg' ? sumNegZero : sumZero;
let t = Date.now(), r = 0;
for (let k = 0; k < 20000; k++) r += f(ints);
const t1 = Date.now() - t; t = Date.now();
for (let k = 0; k < 20000; k++) r += f(dbls);
const t2 = Date.now() - t;
log(`${mode}: ints ${t1} ms, doubles ${t2} ms, total ${t1+t2} ms`);
