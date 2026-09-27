function m(x) { return x % 2; }
%PrepareFunctionForOptimization(m);
for (let i = 0; i < 50; i++) m(i);   // non-negative ints only (negative even -> -0, not Smi)
%OptimizeFunctionOnNextCall(m); m(7);
