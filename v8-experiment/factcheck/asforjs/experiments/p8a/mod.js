const log = typeof print === 'function' ? print : console.log;
const N = 1e6; const a = []; for (let i = 0; i < N; i++) a.push((i * 7919) % 100003);
function mAnd(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] & 1; return c; }
function mMod(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] % 2; return c; }
function bench(n, f) { f(a); f(a); const t = Date.now(); let r = 0; for (let k = 0; k < 50; k++) r += f(a); return `${n} ${Date.now() - t}ms`; }
for (let rep = 0; rep < 3; rep++) log(bench('x&1', mAnd) + ' | ' + bench('x%2', mMod));
