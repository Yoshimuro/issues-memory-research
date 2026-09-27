// Does optimized code drop a computation whose result is unused?
const print = globalThis.print || console.log;
function unused(n) { for (let i = 0; i < n; i++) { const r = Math.sqrt(i) * Math.sin(i); } return n; }
function used(n) { let acc = 0; for (let i = 0; i < n; i++) { const r = Math.sqrt(i) * Math.sin(i); acc += r; } return acc; }
const N = 3e7;
for (let rep = 0; rep < 3; rep++) { let t = Date.now(); unused(N); const a = Date.now() - t; t = Date.now(); const s = used(N); const b = Date.now() - t; print('rep' + rep + ' unused=' + a + 'ms used=' + b + 'ms (' + s.toFixed(1) + ')'); }
