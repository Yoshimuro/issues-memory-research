function doUnused(n, x) { for (let i = 0; i < n; i++) { const r = Math.trunc(x[i & 1023] * 1.5); } return 0; }
function doUsed(n, x) { let s = 0; for (let i = 0; i < n; i++) { s += Math.trunc(x[i & 1023] * 1.5); } return s; }
const x = Array.from({ length: 1024 }, (_, i) => i + 0.25);
for (let rep = 0; rep < 3; rep++) {
  let t0 = Date.now(); doUnused(1e8, x); const tu = Date.now() - t0;
  t0 = Date.now(); const s = doUsed(1e8, x); const tus = Date.now() - t0;
  print('rep', rep, 'unused ms', tu, 'used ms', tus, s > 0);
}
