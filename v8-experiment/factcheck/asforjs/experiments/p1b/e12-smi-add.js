// Machine code for c + 10 on a Smi: with pointer compression (d8) vs without (Node).
function addTen(c) { return c + 10; }
%PrepareFunctionForOptimization(addTen);
for (let i = 0; i < 100; i++) addTen(i);
%OptimizeFunctionOnNextCall(addTen);
addTen(5);
