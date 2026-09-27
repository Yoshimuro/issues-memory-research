// Is code under %NeverOptimizeFunction running in Ignition or Sparkplug? Compare timing against --max-opt=0 / --no-sparkplug.
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
function hot(n){ let s = 0; for (let i = 0; i < n; i++) s = (s + i) | 0; return s; }
%NeverOptimizeFunction(hot);
const t = [];
for (let r = 0; r < 7; r++) { const t0 = now(); hot(1e7); t.push(now() - t0); }
t.sort((a,b)=>a-b);
print('median ms', t[3].toFixed(1), 'all', t.map(x=>x.toFixed(0)).join('/'), 'status', %GetOptimizationStatus(hot).toString(2));
