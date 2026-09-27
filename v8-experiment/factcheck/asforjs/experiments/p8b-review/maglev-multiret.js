// Maglev/TurboFan inlining: tiny function with 2 returns vs 1 return, plus bigger 4-return
function tinyMulti(x) { if (x < 10) return 1; return 2; }
function tinyOne(x) { return x < 10 ? 1 : 2; }
function multiRet(x) { if (x < 10) return 1; if (x < 100) return 2; if (x < 1000) return 3; return 4; }
function oneRet(x) { let r = 4; if (x < 10) r = 1; else if (x < 100) r = 2; else if (x < 1000) r = 3; return r; }
function caller(n) { let s = 0; for (let i = 0; i < n; i++) { const v = i & 2047; s += tinyMulti(v) + tinyOne(v) + multiRet(v) + oneRet(v); } return s; }
for (let k = 0; k < 300; k++) caller(3000);
(globalThis.print || console.log)(caller(10));
