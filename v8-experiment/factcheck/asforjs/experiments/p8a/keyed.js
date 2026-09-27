const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const o = { name: 1, a: 2, b: 3, c: 4 };
const ks = ['name', 'a', 'b', 'c'];
function named(n) { let s = 0; for (let i = 0; i < n; i++) s += o.name; return s; }
function keyedConst(n, k) { let s = 0; for (let i = 0; i < n; i++) s += o[k]; return s; }
function keyedVarying(n) { let s = 0; for (let i = 0; i < n; i++) s += o[ks[i & 3]]; return s; }
function named4(n) { let s = 0; for (let i = 0; i < n; i++) { const j = i & 3; s += j === 0 ? o.name : j === 1 ? o.a : j === 2 ? o.b : o.c; } return s; }
function t(f, ...a) { f(1e4, ...a); f(1e4, ...a); const x = now(); f(3e7, ...a); return (now() - x).toFixed(1); }
for (let r = 0; r < 3; r++) log(`rep${r}: o.name ${t(named)} | o[k] (k always 'name') ${t(keyedConst, 'name')} | o[ks[i&3]] ${t(keyedVarying)} | 4 named via ?: ${t(named4)}`);
