// Number vs BigInt accumulator loop (same process, 3 rounds)
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const N = 3e6;
function numLoop() { let s = 0; for (let i = 0; i < N; i++) s = (s + (i | 0)) & 0xFFFF; return s; }
function bigLoop() { let s = 0n; for (let i = 0; i < N; i++) s = (s + (BigInt(i) | 0n)) & 0xFFFFn; return s; }
function bigAdd64(a, b) { return BigInt.asIntN(64, a + b); }
for (let r = 0; r < 2; r++) { numLoop(); bigLoop(); }
for (let round = 0; round < 3; round++) {
  let t0 = now(); numLoop(); const tn = now() - t0; t0 = now(); bigLoop(); const tb = now() - t0;
  log('round ' + round + ' number=' + tn.toFixed(1) + 'ms bigint=' + tb.toFixed(1) + 'ms ratio=' + (tb / tn).toFixed(0));
}
