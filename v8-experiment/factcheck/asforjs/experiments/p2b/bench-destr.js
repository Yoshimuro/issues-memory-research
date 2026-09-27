// Array pattern vs object pattern with numeric keys vs manual indexing.
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
function arrPat(arr){ const [a, b] = arr; return a + b; }
function objPat(arr){ const {0: a, 1: b} = arr; return a + b; }
function manual(arr){ const a = arr[0], b = arr[1]; return a + b; }
function spreadMax(arr){ return Math.max(...arr); }
function applyMax(arr){ return Math.max.apply(Math, arr); }
const fns = { arrPat, objPat, manual };
const N = 3e6, R = 5;
const data = [3, 4, 5, 6];
function loop(f){ let s = 0; for (let i = 0; i < N; i++) s = (s + f(data)) | 0; return s; }
const res = {}; for (const k in fns) res[k] = [];
for (let r = 0; r < R; r++) for (const k in fns) { const t0 = now(); loop(fns[k]); res[k].push(now() - t0); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const base = med(res.objPat);
for (const k in res) print(k.padEnd(7), 'median', med(res[k]).toFixed(1), 'ms  ratio_vs_objPat', (med(res[k]) / base).toFixed(2), '  all', res[k].map(x => x.toFixed(0)).join('/'));
