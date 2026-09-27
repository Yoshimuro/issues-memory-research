function twoReturns(x) { if (x > 5) return x * 2; return x + 1; }
function usesArguments() { let s = 0; for (let i = 0; i < arguments.length; i++) s += arguments[i]; return s; }
function caller(x) { return twoReturns(x) + usesArguments(x, 1, 2); }
%PrepareFunctionForOptimization(caller); %PrepareFunctionForOptimization(twoReturns); %PrepareFunctionForOptimization(usesArguments);
for (let i = 0; i < 20; i++) caller(i);
%OptimizeFunctionOnNextCall(caller);
caller(3);
