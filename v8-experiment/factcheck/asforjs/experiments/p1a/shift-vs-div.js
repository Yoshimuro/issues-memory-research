// Line 111: in the interpreter, does x>>1 vs x/2 matter?
const log = typeof print === 'function' ? print : console.log;
const now = () => performance.now();
function sh(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + (i >> 1)) | 0; return s; }
function dv(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + (i / 2)) | 0; return s; }
function dvi(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + ((i / 2) | 0)) | 0; return s; }
const N = 1e7;
for (let r = 0; r < 3; r++) { for (const f of [sh, dv, dvi]) { const t0 = now(); f(N); log(f.name, (now() - t0).toFixed(1)); } }
