// Accumulator init 0 vs -0; data: first N ints then doubles, or doubles only
const log = typeof print === 'function' ? print : console.log;
const N = 2e6;
const mixed = new Float64Array(N); for (let i = 0; i < N; i++) mixed[i] = i < N/2 ? (i % 10) : (i % 10) + 0.5;
const arrMixed = Array.from(mixed); // PACKED_DOUBLE
function sumZero(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumNegZero(a) { let s = -0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
const mode = process.argv ? process.argv[2] : (typeof arguments !== 'undefined' ? arguments[0] : 'both');
const f = mode === 'neg' ? sumNegZero : sumZero;
const t = Date.now();
let r = 0; for (let k = 0; k < 20; k++) r += f(arrMixed);
log(`${mode}: ${Date.now() - t} ms r=${r}`);
