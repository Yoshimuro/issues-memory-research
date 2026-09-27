// Math.trunc vs |0 when the accumulator stays int32 (values < 1000) vs becomes double (values ~1e6)
const log = typeof print === 'function' ? print : console.log;
const N = 1e6;
function mk(scale) { const a = new Float64Array(N); for (let i = 0; i < N; i++) a[i] = ((i * 7.37) % 1000 + 0.5) * scale; return a; }
const tiny = mk(1), mid = mk(1000); // tiny: sum ~5e8 fits int32; mid: sum ~5e11 -> double accumulator
function sTrunc(a) { let s = 0; for (let i = 0; i < a.length; i++) s += Math.trunc(a[i]); return s; }
function sOr(a) { let s = 0; for (let i = 0; i < a.length; i++) s += (a[i] | 0); return s; }
function sTruncD(a) { let s = -0; for (let i = 0; i < a.length; i++) s += Math.trunc(a[i]); return s; }
function sOrD(a) { let s = -0; for (let i = 0; i < a.length; i++) s += (a[i] | 0); return s; }
function bench(name, f, a) { f(a); f(a); const t = Date.now(); let r = 0; for (let k = 0; k < 20; k++) r += f(a); return `${name} ${Date.now() - t}ms`; }
for (let rep = 0; rep < 3; rep++) {
  log([bench('trunc tiny', sTrunc, tiny), bench('or tiny', sOr, tiny), bench('trunc mid', sTrunc, mid), bench('or mid', sOr, mid),
       bench('trunc tiny acc=-0', sTruncD, tiny), bench('or tiny acc=-0', sOrD, tiny)].join(' | '));
}
