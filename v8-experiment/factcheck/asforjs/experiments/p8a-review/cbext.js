// reduce with inline arrow vs external callbacks in situations where TurboFan cannot constant-fold the callback
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const arr = Array.from({ length: 1000 }, (_, i) => i & 1023);
const add = (a, b) => a + b;
// 1) single closure, callback is outer const -> context-specialized, foldable
function redInline(a) { return a.reduce((s, x) => s + x, 0); }
function redExtConst(a) { return a.reduce(add, 0); }
// 2) callback passed as parameter (always the same function)
function redParam(a, cb) { return a.reduce(cb, 0); }
// 3) summing function created by a factory several times (many closures => no function-context specialization)
function makeExt() { const cb = (s, x) => s + x; return function redFactExt(a) { return a.reduce(cb, 0); }; }
function makeInl() { return function redFactInl(a) { return a.reduce((s, x) => s + x, 0); }; }
const fe = [makeExt(), makeExt(), makeExt()];
const fi = [makeInl(), makeInl(), makeInl()];
const redFactExt = fe[0], redFactInl = fi[0];
for (const f of fe) f(arr); for (const f of fi) f(arr);
function bench(f, extra) { let r = 0; for (let k = 0; k < 2000; k++) r += f(arr, extra); const t = now(); for (let k = 0; k < 20000; k++) r += f(arr, extra); return (now() - t); }
for (let rep = 0; rep < 3; rep++) {
  log(`rep${rep} inline=${bench(redInline).toFixed(1)} extConst=${bench(redExtConst).toFixed(1)} param=${bench(redParam, add).toFixed(1)} factoryInline=${bench(redFactInl).toFixed(1)} factoryExt=${bench(redFactExt).toFixed(1)}`);
}
