// reduce vs for on small arrays called many times (so the caller gets optimized and reduce is inlined)
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const arr = Array.from({ length: 1000 }, (_, i) => i & 1023);
const add = (a, b) => a + b;
function addFn(a, b) { return a + b; }
function redInline(a) { return a.reduce((acc, x) => acc + x, 0); }
function redExtArrow(a) { return a.reduce(add, 0); }
function redExtFn(a) { return a.reduce(addFn, 0); }
function forSum(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function chain(a) { return a.filter(x => x & 1).map(x => x * 2).reduce((s, x) => s + x, 0); }
function oneReduce(a) { return a.reduce((s, x) => (x & 1) ? s + x * 2 : s, 0); }
function forChain(a) { let s = 0; for (let i = 0; i < a.length; i++) { const x = a[i]; if (x & 1) s += x * 2; } return s; }
function fePlainArrow(a) { const st = { s: 0 }; a.forEach(x => { st.s += x; }); return st.s; }
function feThisArg(a) { const st = { s: 0 }; a.forEach(function (x) { this.s += x; }, st); return st.s; }
function fnArrowOuter(a) { let s = 0; a.forEach(x => { s += x; }); return s; }
function bench(f) { let r = 0; for (let k = 0; k < 2000; k++) r += f(arr); const t = now(); for (let k = 0; k < 20000; k++) r += f(arr); return (now() - t); }
const fs = { forSum, redInline, redExtArrow, redExtFn, chain, oneReduce, forChain, fePlainArrow, feThisArg, fnArrowOuter };
for (let rep = 0; rep < 3; rep++) log(`rep${rep} ` + Object.entries(fs).map(([n, f]) => `${n}=${bench(f).toFixed(1)}`).join(' '));
