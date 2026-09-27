function add(a, b) { return a + b; }
function orTen(x) { return x | 10; }
function sw(x) { switch (x) { case 1: return 10; case 2: return 20; case 3: return 30; } return 0; }
let outer = 5;
function outerAdd() { const c = 2; return outer + c + 10; }
for (let i = 0; i < 3; i++) { %PrepareFunctionForOptimization(add); %PrepareFunctionForOptimization(orTen); %PrepareFunctionForOptimization(sw); %PrepareFunctionForOptimization(outerAdd); }
for (let i = 0; i < 100; i++) { add(i, 2); orTen(i); sw(i % 4); outerAdd(); outer = i; }
%OptimizeFunctionOnNextCall(add); add(1, 2);
%OptimizeFunctionOnNextCall(orTen); orTen(3);
%OptimizeFunctionOnNextCall(sw); sw(2);
%OptimizeFunctionOnNextCall(outerAdd); outerAdd();
