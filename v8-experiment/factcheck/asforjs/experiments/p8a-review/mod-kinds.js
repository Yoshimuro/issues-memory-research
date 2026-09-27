// x%2 vs x&1 on a genuine PACKED_SMI array vs an array of integral doubles (PACKED_DOUBLE)
const log = typeof print === 'function' ? print : console.log;
const N = 1e6;
const smi = []; for (let i = 0; i < N; i++) smi.push((i * 7919) % 100003 | 0);
const dbl = []; for (let i = 0; i < N; i++) dbl.push((i * 7919) % 100003);
log('smi array: HasSmiElements', %HasSmiElements(smi), ' dbl array: HasDoubleElements', %HasDoubleElements(dbl));
function mAnd(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] & 1; return c; }
function mMod(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] % 2; return c; }
function mAndD(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] & 1; return c; }
function mModD(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] % 2; return c; }
function bench(n, f, a) { f(a); f(a); const t = Date.now(); let r = 0; for (let k = 0; k < 50; k++) r += f(a); return `${n} ${Date.now() - t}ms`; }
for (let rep = 0; rep < 3; rep++) log([bench('smi x&1', mAnd, smi), bench('smi x%2', mMod, smi), bench('dbl x&1', mAndD, dbl), bench('dbl x%2', mModD, dbl)].join(' | '));
