// Math.trunc vs |0 on doubles inside and outside int32 range; & 0xFF masks
const log = typeof print === 'function' ? print : console.log;
const N = 1e6;
function mk(scale) { const a = new Float64Array(N); for (let i = 0; i < N; i++) a[i] = (i * 1.37 + 0.5) * scale; return a; }
const small = mk(1), big = mk(1e5); // big: up to ~1.4e11 > 2^31
function sTrunc(a) { let s = 0; for (let i = 0; i < a.length; i++) s += Math.trunc(a[i]) & 0xFF; return s; }
function sOr(a) { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] | 0) & 0xFF; return s; }
function sTruncNoMask(a) { let s = 0; for (let i = 0; i < a.length; i++) s += Math.trunc(a[i]); return s; }
function sOrNoMask(a) { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] | 0); return s; }
function bench(name, f, a) { f(a); f(a); const t = Date.now(); let r = 0; for (let k = 0; k < 20; k++) r += f(a); return `${name} ${Date.now() - t}ms`; }
for (let rep = 0; rep < 3; rep++) {
  log([bench('trunc&FF small', sTrunc, small), bench('or&FF small', sOr, small), bench('trunc&FF big', sTrunc, big), bench('or&FF big', sOr, big),
       bench('trunc big', sTruncNoMask, big), bench('or big', sOrNoMask, big), bench('trunc small', sTruncNoMask, small), bench('or small', sOrNoMask, small)].join(' | '));
}
