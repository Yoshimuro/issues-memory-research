// Line 111: interpreter cost of >>1 vs /2 when both stay Smi (even operand), vs one extra bytecode.
const log = typeof print === 'function' ? print : console.log;
const now = () => performance.now();
function sh(n)  { let s = 0; for (let i = 0; i < n; i++) { const a = i << 1; s = (s + (a >> 1)) | 0; } return s; }
function dv(n)  { let s = 0; for (let i = 0; i < n; i++) { const a = i << 1; s = (s + (a / 2)) | 0; } return s; }
function sh2(n) { let s = 0; for (let i = 0; i < n; i++) { const a = i << 1; s = (s + ((a >> 1) | 0)) | 0; } return s; }
const N = 1e7;
for (let r = 0; r < 4; r++) { let line = ''; for (const f of [sh, dv, sh2]) { const t0 = now(); f(N); line += f.name + ' ' + (now() - t0).toFixed(0) + '  '; } log(line); }
