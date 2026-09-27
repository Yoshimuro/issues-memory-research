function doConstC(a) { const c = 2; return a + c }
%PrepareFunctionForOptimization(doConstC); doConstC(1); doConstC(2);
%OptimizeMaglevOnNextCall(doConstC); doConstC(3);
