// Summary item 2 / line 138: tier ceilings with --max-opt, simple arithmetic loop
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
function loop(n) { let s = 0; for (let i = 0; i < n; i++) { s = (s + (i & 7)) | 0; } return s; }
const N = +((typeof process !== "undefined" && process.argv[2]) || 3e7);
const t0 = now(); const r = loop(N); const t1 = now();
log(`N=${N} time_ms=${(t1 - t0).toFixed(1)} r=${r}`);
