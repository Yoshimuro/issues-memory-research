const N = 1e6; const a = []; for (let i = 0; i < N; i++) a.push((i * 7919) % 100003);
function mMod(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] % 2; return c; }
function mModPos(a) { let c = 0; for (let i = 0; i < a.length; i++) { const x = a[i]; c += x >= 0 ? x % 2 : 0; } return c; }
function mAnd(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] & 1; return c; }
function mMod3(a) { let c = 0; for (let i = 0; i < a.length; i++) c += a[i] % 3; return c; }
function bench(n, f) { f(a); f(a); const t = Date.now(); let r = 0; for (let k = 0; k < 50; k++) r += f(a); return `${n} ${Date.now() - t}ms`; }
for (let rep = 0; rep < 3; rep++) console.log([bench('x&1', mAnd), bench('x%2', mMod), bench('x>=0?x%2', mModPos), bench('x%3', mMod3)].join(' | '));
