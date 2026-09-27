// Fixed workload: ~60 MB live set + 1.5 GB of short/medium-lived churn.
// Run with different --max-old-space-size and count GCs / sum GC pauses from --trace-gc.
const live = [];
for (let i = 0; i < 300000; i++) live.push({ i, s: 'item ' + i, a: [i, i + 1, i + 2] });
let ring = new Array(200000);   // ~40 MB ring: entries get promoted, then die in old space
let sum = 0;
for (let k = 0; k < 3e6; k++) {
  const o = { k, arr: new Array(20).fill(k) };   // ~200 B each
  ring[k % ring.length] = o;                       // medium-lived: survives a few scavenges
  sum += o.arr[3];
}
console.log('done', sum > 0, live.length);
