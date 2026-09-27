function m2(x) { return x % 2; }
function a1(x) { return x & 1; }
%PrepareFunctionForOptimization(m2); %PrepareFunctionForOptimization(a1);
for (let i = 0; i < 100; i++) { m2(i); a1(i); }
%OptimizeFunctionOnNextCall(m2); %OptimizeFunctionOnNextCall(a1); m2(3); a1(3);
