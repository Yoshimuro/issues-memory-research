function f(x) { return x + 1; }
%PrepareFunctionForOptimization(f); f(1); f(2);
%OptimizeFunctionOnNextCall(f); f(3);
