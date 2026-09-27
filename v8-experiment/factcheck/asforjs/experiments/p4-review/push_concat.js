// Accumulate 2e4 chunks of 8 elements: push(...chunk) (occasional growth copies) vs a = a.concat(chunk) (copy every time)
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const chunk = [1, 2, 3, 4, 5, 6, 7, 8], K = 20000;
function viaPush() { const a = []; for (let k = 0; k < K; k++) a.push(...chunk); return a.length; }
function viaConcat() { let a = []; for (let k = 0; k < K; k++) a = a.concat(chunk); return a.length; }
viaPush(); viaConcat();
for (let r = 0; r < 3; r++) {
  let t = now(); viaPush(); const p = now() - t;
  t = now(); viaConcat(); const c = now() - t;
  log(`round ${r} push=${p.toFixed(1)}ms concat=${c.toFixed(1)}ms concat/push=${(c / p).toFixed(0)}`);
}
