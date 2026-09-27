// separate monomorphic sum functions over push-filled SMI vs DOUBLE arrays (same process, 5 rounds)
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const N = 1e6;
const aS = []; for (let i = 0; i < N; i++) aS.push(i & 1023);
const aD = []; for (let i = 0; i < N; i++) aD.push((i & 1023) + 0.5);
function sumS(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumD(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
for (let r = 0; r < 5; r++) { sumS(aS); sumD(aD); }
for (let round = 0; round < 5; round++) {
  let t0 = now(); for (let r = 0; r < 30; r++) sumS(aS); const ts = now() - t0;
  t0 = now(); for (let r = 0; r < 30; r++) sumD(aD); const td = now() - t0;
  log('round ' + round + ' sumSmi=' + ts.toFixed(1) + ' sumDbl=' + td.toFixed(1) + ' dbl/smi=' + (td / ts).toFixed(2));
}
