// const PI = 3.14 vs const PIf = () => 3.14 : what does TurboFan emit?
const PI = 3.14;
const PIf = () => 3.14;
function areaConst(r) { return PI * r * r; }
function areaFn(r) { return PIf() * r * r; }
for (const f of [areaConst, areaFn]) { %PrepareFunctionForOptimization(f); f(1.5); f(2.5); %OptimizeFunctionOnNextCall(f); f(3.5); }
