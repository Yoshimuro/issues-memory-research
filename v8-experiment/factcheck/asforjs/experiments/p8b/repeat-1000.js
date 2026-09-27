// After how many calls does a small function tier up? (loop of 1000 calls, then report status)
const print = globalThis.print || console.log;
function expr(a, b) { return Math.trunc(a / b) + (a % b); }
let s = 0;
for (let i = 1; i <= 1000; i++) { s += expr(i * 7, (i % 13) + 1); if (i === 10 || i === 100 || i === 400 || i === 1000) print('after ' + i + ' calls: status=' + %GetOptimizationStatus(expr).toString(2)); }
print(s);
