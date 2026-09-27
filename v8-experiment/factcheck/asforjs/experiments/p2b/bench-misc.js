// (1) f(...arr) vs f(a,b,c) vs f.apply; (2) x>>1 vs x/2 in interpreter; (3) rough ns per bytecode.
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
function f3(a, b, c){ return a + b + c; }
const arr = [1, 2, 3];
function viaSpread(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + f3(...arr)) | 0; return s; }
function viaDirect(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + f3(arr[0], arr[1], arr[2])) | 0; return s; }
function viaApply(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + f3.apply(null, arr)) | 0; return s; }
function shr(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + (i >> 1)) | 0; return s; }
function div(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + (i / 2)) | 0; return s; }
function empty(n){ let s = 0; for (let i = 0; i < n; i++) s = s + 1; return s; } // loop body: ~10 bytecodes per iteration
const fns = { viaSpread, viaDirect, viaApply, shr, div, empty };
const N = 3e6, R = 5, res = {};
for (const k in fns) res[k] = [];
for (let r = 0; r < R; r++) for (const k in fns) { const t0 = now(); fns[k](N); res[k].push(now() - t0); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k in res) print(k.padEnd(9), 'median', med(res[k]).toFixed(1), 'ms  per-iter ns', (med(res[k]) * 1e6 / N).toFixed(1), '  all', res[k].map(x => x.toFixed(0)).join('/'));
print('spread/direct', (med(res.viaSpread) / med(res.viaDirect)).toFixed(2), ' apply/direct', (med(res.viaApply) / med(res.viaDirect)).toFixed(2), ' div/shr', (med(res.div) / med(res.shr)).toFixed(2));
