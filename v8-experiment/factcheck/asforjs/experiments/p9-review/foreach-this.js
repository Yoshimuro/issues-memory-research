// p9-66 / line 1301: is forEach with thisArg much slower (~5x) than a for loop once optimized?
const log = typeof console !== 'undefined' ? console.log : print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const arr = Array.from({ length: 1e6 }, (_, i) => i);
function viaFor(a) { const o = { s: 0 }; for (let i = 0; i < a.length; i++) o.s += a[i]; return o.s; }
function viaForEachThis(a) { const o = { s: 0 }; a.forEach(function (x) { this.s += x; }, o); return o.s; }
function viaForEachArrow(a) { const o = { s: 0 }; a.forEach((x) => { o.s += x; }); return o.s; }
function bench(f) { for (let i = 0; i < 20; i++) f(arr); const t = now(); for (let i = 0; i < 50; i++) f(arr); return (now() - t) / 50; }
for (let rep = 0; rep < 3; rep++) {
  const a = bench(viaFor), b = bench(viaForEachThis), c = bench(viaForEachArrow);
  log(`rep ${rep}: for ${a.toFixed(2)} ms, forEach(this) ${b.toFixed(2)} ms (x${(b / a).toFixed(1)}), forEach(arrow) ${c.toFixed(2)} ms (x${(c / a).toFixed(1)})`);
}
