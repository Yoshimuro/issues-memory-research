// Is there a performance cliff at 65535 elements? ns per element for build (push) + sum + map
const log = typeof print === 'function' ? print : console.log;
function build(n) { const a = []; for (let i = 0; i < n; i++) a.push(i & 1023); return a; }
function sum(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function mapInc(a) { return a.map(x => x + 1); }
const TOTAL = 3e7;
for (let w = 0; w < 3; w++) { const a = build(1000); sum(a); mapInc(a); }
for (let rep = 0; rep < 3; rep++) {
  const row = [];
  for (const n of [16384, 32768, 65535, 65536, 70000, 131072, 1000000]) {
    const reps = Math.max(1, Math.round(TOTAL / n)); let t = Date.now(), s = 0;
    for (let r = 0; r < reps; r++) { const a = build(n); s += sum(a); s += mapInc(a).length; }
    row.push(`${n}:${((Date.now() - t) * 1e6 / (reps * n)).toFixed(2)}ns`);
  }
  log(`rep${rep} ` + row.join(' '));
}
