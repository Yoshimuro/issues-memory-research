const P = typeof print === 'function' ? print : console.log;
const N = 1 << 20;
const small = new Float64Array(N), big = new Float64Array(N);
for (let i = 0; i < N; i++) { small[i] = (i % 1000) + 0.37; big[i] = (i % 1000) * 1e6 + 0.37; }
function orInt(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + (a[i] | 0)) | 0; return s; }
function truncInt(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + Math.trunc(a[i])) | 0; return s; }
function orDbl(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] | 0; return s; }
function truncDbl(a) { let s = 0; for (let i = 0; i < a.length; i++) s += Math.trunc(a[i]); return s; }
function t(f, a) { let r = 0; const t0 = Date.now(); for (let k = 0; k < 40; k++) r += f(a); return [Date.now() - t0, r]; }
for (const [name, a] of [['small', small], ['big', big]]) {
  for (let w = 0; w < 3; w++) { t(orInt, a); t(truncInt, a); t(orDbl, a); t(truncDbl, a); }
  const rows = [];
  for (let k = 0; k < 3; k++) rows.push([t(orInt, a)[0], t(truncInt, a)[0], t(orDbl, a)[0], t(truncDbl, a)[0]]);
  P(name + '  int-acc |0 vs trunc: ' + rows.map(r => r[0] + '/' + r[1]).join(' ') + '   double-acc |0 vs trunc: ' + rows.map(r => r[2] + '/' + r[3]).join(' '));
}
