// Bytecode flushing is age-based (N full GCs without execution), not "low memory".
// Run: node --expose-gc --trace-flush-code flush.js
function doRare(a) { let s = 0; for (let i = 0; i < a; i++) s += i; return s }
doRare(3);
const before = %GetOptimizationStatus(doRare);
for (let i = 0; i < 12; i++) gc();
console.log('heap used MB:', (process.memoryUsage().heapUsed / 1e6).toFixed(1));
%DebugPrint(doRare);
