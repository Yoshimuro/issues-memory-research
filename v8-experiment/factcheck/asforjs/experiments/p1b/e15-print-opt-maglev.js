// Does --print-opt-code also print Maglev code, or only TurboFan?
function mg(a) { return a * 2 + 1; }
%PrepareFunctionForOptimization(mg); mg(1); mg(2);
%OptimizeMaglevOnNextCall(mg); mg(3);
console.log('status', %GetOptimizationStatus(mg).toString(2));
