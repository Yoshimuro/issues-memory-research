// ESM variant: outer is a module variable (Cell), reassigned in the loop
let outer = 5;
function outerAdd() { const c = 2; return outer + c + 10; }
for (let i = 0; i < 3; i++) %PrepareFunctionForOptimization(outerAdd);
for (let i = 0; i < 100; i++) { outerAdd(); outer = i; }
%OptimizeFunctionOnNextCall(outerAdd); outerAdd();
