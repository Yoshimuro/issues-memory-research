function doHot(a) { return a + 1 }
%PrepareFunctionForOptimization(doHot); doHot(1); doHot(2); %OptimizeFunctionOnNextCall(doHot); doHot(3);
%DebugPrint(doHot);
