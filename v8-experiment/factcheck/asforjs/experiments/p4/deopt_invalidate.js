// Non-OSR function deopt: is the optimized code invalidated? (d8 15.6 prints code_invalidation in --trace-deopt-verbose)
function add(a, b) { return a + b; }
%PrepareFunctionForOptimization(add);
for (let i = 0; i < 100; i++) add(i, 1);
%OptimizeFunctionOnNextCall(add); add(1, 2);
const p = (typeof print === 'function') ? print : console.log;
p('status before=' + %GetOptimizationStatus(add).toString(2));
add(1.5, 2);  // not a Smi
p('status after=' + %GetOptimizationStatus(add).toString(2));
