function f(a, b) { return (a | 0) + (b | 0); }
%PrepareFunctionForOptimization(f);
f(1, 2); f(3, 4);
%OptimizeFunctionOnNextCall(f);
f(5, 6);
