// p1b-35 / p1b-83: cost of one eager deopt vs one synchronous TurboFan compile, no tracing.
const log = typeof console !== 'undefined' ? console.log : print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const N = 300, comp = [], deo = [], base = [];
for (let k = 0; k < N; k++) {
  const f = new Function('a', 'b', `/*${k}*/ let s = 0; for (let i = 0; i < 4; i++) s += a * i + b; return s;`);
  %PrepareFunctionForOptimization(f);
  for (let i = 0; i < 50; i++) f(i, 1);
  let t = now(); f(3, 1); base.push(now() - t);
  %OptimizeFunctionOnNextCall(f);
  t = now(); f(3, 1); comp.push(now() - t);          // synchronous TurboFan compile + call
  t = now(); f(3.5, 1); deo.push(now() - t);         // eager deopt (not a Smi) + interpreter call
}
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1].toFixed(4); };
log(`median ms: plain call ${med(base)} | TF compile+call ${med(comp)} | deopt+call ${med(deo)}`);
