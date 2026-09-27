// колбэк reduce: литерал на месте vs внешний идентификатор (const в замыкании / глобальная function); без OSR (много вызовов)
const print = globalThis.print || console.log;
const arr = []; for (let i = 0; i < 100; i++) arr.push(i);
function globalFn(a, x) { return (a + x) & 0xffff; }
function make() {
  const ctxConst = (a, x) => (a + x) & 0xffff;
  return {
    inline(a) { return a.reduce((s, x) => (s + x) & 0xffff, 0); },
    viaCtx(a) { return a.reduce(ctxConst, 0); },
    viaGlobal(a) { return a.reduce(globalFn, 0); },
  };
}
const h = make();
const R = 200000;
for (let rep = 0; rep < 4; rep++) { const out = []; for (const nm of ['inline', 'viaCtx', 'viaGlobal']) { const f = h[nm]; const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c = (c + f(arr)) & 0xffff; out.push(nm + '=' + (Date.now() - t) + 'ms'); } print('rep' + rep + ' ' + out.join(' ')); }
