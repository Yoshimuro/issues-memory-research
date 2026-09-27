// Doc line 405: "Файл целиком проходит парсинг и Static Semantics (поэтому let/const стоят холодного старта)".
// Compile (parse+preparse) time of a big script whose functions use var vs let/const; interleaved, repeated.
const vm = require('vm');
function gen(kw, nf){ let s = ''; for (let i = 0; i < nf; i++) { s += `function f${i}(a){ ${kw} x${i} = a + 1; ${kw} y${i} = x${i} * 2; { ${kw} z = y${i} + x${i}; if (z > 3) { return z; } } return () => x${i} + y${i}; }\n`; } return s; }
const NF = 20000;
const src = { var: gen('var', NF), let: gen('let', NF), const: gen('const', NF) };
const res = { var: [], let: [], const: [] };
for (let r = 0; r < 9; r++) for (const k of ['var', 'let', 'const']) {
  const code = src[k] + `\n//${r}${k}`; // defeat compilation cache
  const t0 = process.hrtime.bigint(); new vm.Script(code); res[k].push(Number(process.hrtime.bigint() - t0) / 1e6);
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k in res) console.log(k.padEnd(5), 'compile median', med(res[k]).toFixed(1), 'ms  ratio_vs_var', (med(res[k]) / med(res.var)).toFixed(3), ' all', res[k].map(x => x.toFixed(0)).join('/'), ' srcKB', (src[k].length / 1024).toFixed(0));
