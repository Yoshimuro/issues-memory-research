// GC cost vs heap limit: keep ~60 MB live, churn short-lived objects that survive a bit.
// node --max-old-space-size=<N> heap-limit-perf.js
const live = []; for (let i = 0; i < 6e5; i++) live.push({ i, s: 'v' + i, arr: [i, i] });
let ring = new Array(2e5); let t = process.hrtime.bigint();
for (let i = 0; i < 2e7; i++) ring[i % ring.length] = { i, p: [i] };   // objects survive a while -> promoted
const ms = Number(process.hrtime.bigint() - t) / 1e6;
console.log(`max-old=${process.execArgv.join(' ')} time ${ms.toFixed(0)} ms, live ${live.length}`);
