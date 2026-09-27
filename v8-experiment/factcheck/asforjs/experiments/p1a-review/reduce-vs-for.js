// Line 138 / summary item 11: reduce vs for on 10 000 elements, with and without optimization
const log = typeof print === 'function' ? print : console.log;
const now = () => performance.now();
const arr = Array.from({ length: 10000 }, (_, i) => i % 100);
function sumFor(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumReduce(a) { return a.reduce((acc, x) => acc + x, 0); }
const R = +((typeof process !== "undefined" ? process.argv[2] : arguments[0]) || 2000);
for (let rep = 0; rep < 3; rep++) for (const f of [sumFor, sumReduce]) { const t0 = now(); let r = 0; for (let k = 0; k < R; k++) r += f(arr); log(f.name, (now() - t0).toFixed(0)); }
