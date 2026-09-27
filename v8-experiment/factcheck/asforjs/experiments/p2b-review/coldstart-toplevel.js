// Top-level declarations: compile+run time of a script with 20000 top-level var vs let vs const (plus functions reading them).
const vm = require('vm');
function gen(kw, n){ let s = ''; for (let i = 0; i < n; i++) s += `${kw} g${i} = ${i}; function r${i}(){ return g${i} + 1; }\n`; s += 'let acc = 0; for (let j = 0; j < ' + n + '; j += 97) acc += 1;'; return s; }
const N = 20000, kinds = ['var', 'let', 'const'], res = {}; for (const k of kinds) res[k] = [];
for (let r = 0; r < 7; r++) for (const k of kinds) {
  const code = gen(k, N) + `\n//${r}`;
  const ctx = vm.createContext({});
  const t0 = process.hrtime.bigint(); new vm.Script(code).runInContext(ctx); res[k].push(Number(process.hrtime.bigint() - t0) / 1e6);
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k of kinds) console.log(k.padEnd(5), 'compile+run median', med(res[k]).toFixed(1), 'ms ratio_vs_var', (med(res[k]) / med(res.var)).toFixed(3), ' all', res[k].map(x => x.toFixed(0)).join('/'));
