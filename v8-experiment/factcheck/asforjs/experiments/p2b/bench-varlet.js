// Outer var vs let vs const (context slots) vs locals (registers). Modes chosen by flags:
//   --max-opt=0 (pure Ignition), --max-opt=1 (Ignition+Sparkplug), default (full tiering).
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
function makeVar(){ var a = 1, b = 2, c = 3; function sumVar(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; } return sumVar; }
function makeLet(){ let a = 1, b = 2, c = 3; function sumLet(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; } return sumLet; }
function makeConst(){ const a = 1, b = 2, c = 3; function sumConst(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; } return sumConst; }
function makeLetArrow(){ let a = 1, b = 2, c = 3; const sumLetArrow = (n) => { let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; }; return sumLetArrow; }
function sumLocal(n){ var a = 1, b = 2, c = 3; let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; }
function makeLetCopy(){ let a = 1, b = 2, c = 3; function sumLetCopy(n){ const x = a, y = b, z = c; let s = 0; for (let i = 0; i < n; i++) { s = (s + x + y + z) | 0; } return s; } return sumLetCopy; }
const fns = { var: makeVar(), let: makeLet(), const: makeConst(), letArrow: makeLetArrow(), local: sumLocal, letCopy: makeLetCopy() };
const N = +(typeof process !== 'undefined' ? (process.env.N || 1e7) : 1e7);
const R = 5;
const res = {};
for (const k in fns) res[k] = [];
for (let r = 0; r < R; r++) {
  for (const k in fns) { const t0 = now(); fns[k](N); res[k].push(now() - t0); }
}
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
const base = med(res.var);
for (const k in res) print(k.padEnd(9), 'median', med(res[k]).toFixed(1), 'ms  ratio_vs_var', (med(res[k]) / base).toFixed(3), '  all', res[k].map(x => x.toFixed(0)).join('/'));
