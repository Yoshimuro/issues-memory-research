// Line 162/166: doSum(1), doSum(-1), doSum(0.1); sum = 0 vs sum = -0
const isD8 = typeof process === 'undefined';
const log = isD8 ? print : console.log;
const variant = isD8 ? arguments[0] : process.argv[2];
const N = 3e5;
function doSumZero(x) { let sum = 0; for (let i = 0; i < N; i++) sum += x; return sum; }
function doSumNegZero(x) { let sum = -0; for (let i = 0; i < N; i++) sum += x; return sum; }
const f = variant === 'negzero' ? doSumNegZero : doSumZero;
const t0 = Date.now();
const r = f(1) + f(-1) + f(0.1);
log(`${variant} ms=${Date.now() - t0} r=${r}`);
