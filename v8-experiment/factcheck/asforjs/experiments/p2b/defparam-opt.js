// Does a default parameter prevent TurboFan optimization / inlining?
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
function withDef(x = 7){ return x / 2; }
function caller(i){ return withDef(i) + withDef(); }
%PrepareFunctionForOptimization(withDef); %PrepareFunctionForOptimization(caller);
for (let i = 0; i < 100; i++) caller(i);
%OptimizeFunctionOnNextCall(caller); caller(1);
%OptimizeFunctionOnNextCall(withDef); withDef(1);
print('caller', %GetOptimizationStatus(caller).toString(2), 'withDef', %GetOptimizationStatus(withDef).toString(2));
