// принудительная оптимизация outer без %PrepareFunctionForOptimization(inner): зависит от числа предварительных вызовов
const print = globalThis.print || console.log;
const K = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 2);
function inner(x) { return x * 2 + 1; }
function outer(x) { return inner(x) + 1; }
%PrepareFunctionForOptimization(outer);
for (let i = 0; i < K; i++) outer(i);
%OptimizeFunctionOnNextCall(outer); outer(1);
print('K=' + K + ' outer status=' + %GetOptimizationStatus(outer).toString(2));
