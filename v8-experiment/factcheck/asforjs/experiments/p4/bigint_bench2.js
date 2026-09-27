// Unmasked accumulator: s += BigInt(i) | 0n  vs  s += i | 0 (same process, 3 rounds)
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const N = 3e6;
function numLoop() { let s = 0; for (let i = 0; i < N; i++) s += i | 0; return s; }
function bigLoop() { let s = 0n; for (let i = 0; i < N; i++) s += BigInt(i) | 0n; return s; }
function bigOnly() { let s = 0n; for (let i = 0n; i < 3000000n; i++) s += i; return s; }
for (let r = 0; r < 2; r++) { numLoop(); bigLoop(); bigOnly(); }
for (let round = 0; round < 3; round++) {
  let t0 = now(); numLoop(); const tn = now() - t0; t0 = now(); bigLoop(); const tb = now() - t0; t0 = now(); bigOnly(); const to = now() - t0;
  log('round ' + round + ' number=' + tn.toFixed(1) + 'ms bigint(BigInt(i)|0n)=' + tb.toFixed(1) + 'ms ratio=' + (tb / tn).toFixed(0) + ' pure-bigint-loop=' + to.toFixed(1) + 'ms ratio=' + (to / tn).toFixed(0));
}
