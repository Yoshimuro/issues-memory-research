// Does optimized code add two small BigInts with a machine add or via a builtin/runtime call?
function addBig(a, b) { const r = a + b; return r < 100n; }  // result not escaping
function addBigRet(a, b) { return a + b; }                  // result escapes (must be a heap BigInt)
function constBig() { return 1n + 2n; }
%PrepareFunctionForOptimization(addBig); %PrepareFunctionForOptimization(addBigRet); %PrepareFunctionForOptimization(constBig);
for (let i = 0; i < 100; i++) { addBig(BigInt(i), 3n); addBigRet(BigInt(i), 3n); constBig(); }
%OptimizeFunctionOnNextCall(addBig); addBig(1n, 2n);
%OptimizeFunctionOnNextCall(addBigRet); addBigRet(1n, 2n);
%OptimizeFunctionOnNextCall(constBig); constBig();
