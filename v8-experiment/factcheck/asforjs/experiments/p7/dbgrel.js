function doLoop(n) { let s = 0; for (let i = 0; i < n; i++) s += i & 7; return s; }
function doObj(n) { let s = 0; for (let i = 0; i < n; i++) { const o = { a: i, b: i + 1 }; s += o.a + o.b; } return s; }
const t0 = Date.now(); let r = 0;
for (let k = 0; k < 10; k++) r += doLoop(1e7) + doObj(1e6);
print('ms', Date.now() - t0, r);
