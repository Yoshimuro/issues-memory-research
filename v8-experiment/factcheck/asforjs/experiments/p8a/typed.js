const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const N = 1e6;
const ad = Array.from({ length: N }, (_, i) => i * 0.5), fd = Float64Array.from(ad);
const ai = Array.from({ length: N }, (_, i) => i & 1023), ii = Int32Array.from(ai);
function sum(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumF(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumI(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumTI(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function t(f, a) { for (let k = 0; k < 5; k++) f(a); const x = now(); for (let k = 0; k < 50; k++) f(a); return (now() - x).toFixed(1); }
for (let r = 0; r < 3; r++) log(`rep${r}: Array(double) ${t(sum, ad)} | Float64Array ${t(sumF, fd)} | Array(smi) ${t(sumI, ai)} | Int32Array ${t(sumTI, ii)}`);
