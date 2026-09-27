function withThrow(x) { if (x < 0) throw new Error('neg'); return x * 2; }
function withTry(x) { try { return withThrow(x); } catch (e) { return -1; } }
class K { m(x) { return x + 1; } } const k = new K(); const lit = { m(x) { return x + 1; } }; function free(x) { return x + 1; }
function callers(n) { let s = 0; for (let i = 0; i < n; i++) s += k.m(i) + lit.m(i) + free(i); return s; }
for (const f of [withThrow, withTry, callers]) { %PrepareFunctionForOptimization(f); }
for (let i = 0; i < 100; i++) { withThrow(i); withTry(i); } callers(100); withTry(-1);
for (const f of [withThrow, withTry, callers]) %OptimizeFunctionOnNextCall(f);
withThrow(1); withTry(1); callers(10);
for (const f of [withThrow, withTry, callers]) console.log(f.name, 'TurboFanned:', (%GetOptimizationStatus(f) & 16) !== 0);
