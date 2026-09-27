// plain arrays (PACKED_SMI / PACKED_DOUBLE) vs typed arrays in an optimized numeric loop
const print = globalThis.print || console.log;
const n = 1 << 20;
const smi = [], dbl = []; for (let i = 0; i < n; i++) { smi.push(i & 1023); dbl.push((i & 1023) + 0.5); }
const i32 = Int32Array.from(smi), f64 = Float64Array.from(dbl);
function sum(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumI(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) | 0; return s; }
function scale(a, k) { for (let i = 0; i < a.length; i++) a[i] = a[i] * k; }
const cases = [['sumI smi[]', () => sumI(smi)], ['sumI Int32Array', () => sumI(i32)], ['sum double[]', () => sum(dbl)], ['sum Float64Array', () => sum(f64)], ['scale double[]', () => scale(dbl, 1.0000001)], ['scale Float64Array', () => scale(f64, 1.0000001)]];
for (let rep = 0; rep < 3; rep++) { const out = []; for (const [nm, f] of cases) { const t = Date.now(); for (let k = 0; k < 100; k++) f(); out.push(nm + '=' + (Date.now() - t)); } print('rep' + rep + ' ' + out.join(' ')); }
