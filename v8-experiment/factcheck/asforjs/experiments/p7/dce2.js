function doUnused(n, y) { for (let i = 0; i < n; i++) { const r = Math.trunc(i * y) | 0; } return 0; }
function doUsed(n, y) { let s = 0; for (let i = 0; i < n; i++) { s = (s + (Math.trunc(i * y) | 0)) | 0; } return s; }
for (let rep = 0; rep < 3; rep++) {
  let t0 = Date.now(); doUnused(3e8, 1.5); const tu = Date.now() - t0;
  t0 = Date.now(); const s = doUsed(3e8, 1.5); const tus = Date.now() - t0;
  print('rep', rep, 'unused ms', tu, 'used ms', tus, s !== 0.5);
}
