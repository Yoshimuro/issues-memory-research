function f(o){ return o.a + o.a * 3 + o.a * 7; }
const o = {a: 5, b: 1};
%PrepareFunctionForOptimization(f); f(o); f(o); %OptimizeFunctionOnNextCall(f); f(o);
