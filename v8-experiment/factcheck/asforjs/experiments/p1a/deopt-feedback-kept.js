// Line 162: after deopt, is feedback reset ("статистика собирается заново") or kept?
function getX(o) { return o.x; }
const a = { x: 1 }, b = { y: 2, x: 3 };
%PrepareFunctionForOptimization(getX);
for (let i = 0; i < 100; i++) getX(a);
%OptimizeFunctionOnNextCall(getX); getX(a);
print('before deopt status=' + %GetOptimizationStatus(getX).toString(2));
getX(b);   // wrong map -> deopt
print('after deopt status=' + %GetOptimizationStatus(getX).toString(2));
%DebugPrint(getX);
