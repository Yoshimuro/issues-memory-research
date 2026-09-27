// push/pop oscillation right at a capacity boundary vs inside capacity.
// Push-grown capacities (V8 NewElementsCapacity(len+1) = len+1 + (len+1)/2 + 16): 17,43,82,140,227,358,554,848,1289,1951,2944,4433
// (1951 and 4433 confirmed with d8 debug %DebugPrint, see cap-d8dbg.txt)
const log = typeof print === 'function' ? print : console.log;
function osc(a, k, iters) { let s = 0; for (let it = 0; it < iters; it++) { for (let j = 0; j < k; j++) a.push(j); for (let j = 0; j < k; j++) s += a.pop(); } return s; }
function run(len, k, iters) { const a = []; for (let i = 0; i < len; i++) a.push(i); const t = Date.now(); osc(a, k, iters); return Date.now() - t; }
run(1000, 4, 100000); run(1289, 4, 100000);
for (let rep = 0; rep < 3; rep++) {
  log(`rep${rep}: k=4  boundary len=1289: ${run(1289, 4, 2e6)}ms | inside len=1500: ${run(1500, 4, 2e6)}ms || k=700 from len=900 (crosses trim/grow thresholds): ${run(900, 700, 1e4)}ms | k=700 from len=2000 (inside cap 2944): ${run(2000, 700, 1e4)}ms`);
}
