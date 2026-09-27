// outer is a script-level let that is never reassigned
let outer = 5;
function outerAdd() { const c = 2; return outer + c + 10; }
%PrepareFunctionForOptimization(outerAdd);
for (let i = 0; i < 100; i++) outerAdd();
%OptimizeFunctionOnNextCall(outerAdd); outerAdd();
