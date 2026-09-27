function doHot(a) { return a + 1 }
function doWarm(a) { return a + 2 }
%PrepareFunctionForOptimization(doHot); doHot(1); doHot(2); %OptimizeFunctionOnNextCall(doHot); doHot(3);
%CompileBaseline(doWarm); doWarm(1);
print("=== TURBOFAN ==="); %DebugPrint(doHot);
print("=== BASELINE ==="); %DebugPrint(doWarm);
