// Line 138 (4th example), read-only variant: loop adds outer let/var/const values vs local copies
const log = typeof print === 'function' ? print : console.log;
const now = () => performance.now();
const mode = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
let oa = 1, ob = 2; var va = 1, vb = 2; const ca = 1, cb = 2;
function sumOuterLet(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + oa + ob) | 0; return s; }
function sumOuterVar(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + va + vb) | 0; return s; }
function sumOuterConst(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + ca + cb) | 0; return s; }
function sumLocal(n) { const a = 1, b = 2; let s = 0; for (let i = 0; i < n; i++) s = (s + a + b) | 0; return s; }
const fs = [sumOuterLet, sumOuterVar, sumOuterConst, sumLocal];
if (mode === 'never') fs.forEach(f => %NeverOptimizeFunction(f));
for (let rep = 0; rep < 3; rep++) for (const f of fs) { const t0 = now(); f(2e7); log(f.name, (now() - t0).toFixed(0)); }
