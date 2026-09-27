// Does deoptimization keep the same BytecodeArray?
function doHot(a) { return a + 1 }
doHot(1);
%DebugPrint(doHot);                       // interpreted: bytecode address #1
%PrepareFunctionForOptimization(doHot); doHot(1); doHot(2);
%OptimizeFunctionOnNextCall(doHot); doHot(3);
print("optimized:", %GetOptimizationStatus(doHot).toString(2));
doHot("x");                               // type change -> deopt
print("after deopt:", %GetOptimizationStatus(doHot).toString(2));
%DebugPrint(doHot);                       // bytecode address #2
