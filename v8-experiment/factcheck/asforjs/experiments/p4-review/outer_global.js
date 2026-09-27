// global-object property variant: outer is a property of globalThis (PropertyCell)
globalThis.outer = 5;
function outerAdd() { const c = 2; return outer + c + 10; }
%PrepareFunctionForOptimization(outerAdd);
for (let i = 0; i < 100; i++) { outerAdd(); globalThis.outer = i; }
%OptimizeFunctionOnNextCall(outerAdd); outerAdd();
