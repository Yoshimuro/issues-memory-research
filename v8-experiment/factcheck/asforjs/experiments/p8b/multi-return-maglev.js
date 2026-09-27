// Maglev: same logic with 4 returns vs 1 return
function multiRet(x) { if (x < 10) return 1; if (x < 100) return 2; if (x < 1000) return 3; return 4; }
function oneRet(x) { let r = 4; if (x < 10) r = 1; else if (x < 100) r = 2; else if (x < 1000) r = 3; return r; }
function caller(n) { let s = 0; for (let i = 0; i < n; i++) s += multiRet(i & 2047) + oneRet(i & 2047); return s; }
for (let k = 0; k < 200; k++) caller(5000);
print(caller(10));
