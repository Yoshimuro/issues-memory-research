// Does TurboFan inline callees that use rest / arguments / spread calls, and do they get optimized at all?
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
function fixed(a, b, c){ return a + b + c; }
function rest(...args){ return args[0] + args[1] + args[2]; }
function useArgs(){ return arguments[0] + arguments[1] + arguments[2]; }
function callFixed(x){ return fixed(x, 1, 2); }
function callRest(x){ return rest(x, 1, 2); }
function callArgs(x){ return useArgs(x, 1, 2); }
const arr = [1, 2, 3];
function callSpread(x){ return fixed(...arr); }
function callApply(x){ return fixed.apply(null, arr); }
const callers = [callFixed, callRest, callArgs, callSpread, callApply];
for (const c of callers) { %PrepareFunctionForOptimization(c); }
for (const f of [fixed, rest, useArgs]) %PrepareFunctionForOptimization(f);
for (let i = 0; i < 100; i++) for (const c of callers) c(i);
for (const c of callers) { %OptimizeFunctionOnNextCall(c); c(1); }
for (const f of [fixed, rest, useArgs]) { %OptimizeFunctionOnNextCall(f); f(1,2,3); }
for (const c of [...callers, fixed, rest, useArgs]) print(c.name, 'status', %GetOptimizationStatus(c).toString(2), 'optimized(bit4 in <=13.6)', !!(%GetOptimizationStatus(c) & 16));
