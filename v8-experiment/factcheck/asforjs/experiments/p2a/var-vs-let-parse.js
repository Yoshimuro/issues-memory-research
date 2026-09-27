// Synthetic "bundle": N lazily-compiled functions with many declarations, var vs let.
// Measures (a) load = parse+preparse+top-level run, (b) first call of every function.
// Run: d8 var-vs-let-parse.js  |  node var-vs-let-parse.js
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const log = typeof print === 'function' ? print : console.log;
function gen(kw, n, salt) {
  let s = `// ${salt}\nvar __fns = [];\n`;
  for (let i = 0; i < n; i++) {
    s += `function f${i}(p) {\n`;
    for (let j = 0; j < 12; j++) s += `  ${kw} v${j} = p + ${j};\n  if (v${j} > 100) { ${kw} w${j} = v${j} * 2; p = w${j}; }\n`;
    s += `  return p;\n}\n__fns.push(f${i});\n`;
  }
  return s;
}
const N = 4000;
const res = { var: { load: [], call: [] }, let: { load: [], call: [] } };
let salt = 0;
for (let rep = 0; rep < 6; rep++) {
  for (const kw of (rep % 2 ? ['var', 'let'] : ['let', 'var'])) {
    const src = gen(kw, N, `${kw}-${rep}-${salt++}-${Math.random()}`);
    const t0 = now();
    (0, eval)(src);
    const t1 = now();
    for (const f of globalThis.__fns) f(1);
    const t2 = now();
    res[kw].load.push(t1 - t0); res[kw].call.push(t2 - t1);
    if (rep === 0 && kw === 'var') log(`source size: ${(src.length / 1e6).toFixed(2)} MB`);
  }
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const fmt = a => a.map(x => x.toFixed(1)).join(' ');
for (const k of ['load', 'call']) {
  log(`${k}: var [${fmt(res.var[k])}] median ${med(res.var[k]).toFixed(1)} ms | let [${fmt(res.let[k])}] median ${med(res.let[k]).toFixed(1)} ms | let/var = ${(med(res.let[k]) / med(res.var[k])).toFixed(2)}`);
}
