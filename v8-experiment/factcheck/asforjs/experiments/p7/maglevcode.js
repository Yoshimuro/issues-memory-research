function doInc(x) { return x + 1; }
function doProp(o) { return doInc(o.x) + 0x7FFF; }
%PrepareFunctionForOptimization(doInc);
%PrepareFunctionForOptimization(doProp);
for (let i = 0; i < 10; i++) doProp({ x: i });
%OptimizeMaglevOnNextCall(doProp);
doProp({ x: 1 });
