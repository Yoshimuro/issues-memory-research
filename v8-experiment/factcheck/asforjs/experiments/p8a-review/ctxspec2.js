// Many closures (no function-context specialization): plain const vs function-constant
function makeC() { const PI = 3.14; return function areaC(r) { return PI * r * r; }; }
function makeF() { const PI = () => 3.14; return function areaF(r) { return PI() * r * r; }; }
const c = [makeC(), makeC(), makeC()][0];
const f = [makeF(), makeF(), makeF()][0];
for (const g of [c, f]) { %PrepareFunctionForOptimization(g); for (let i = 0; i < 50; i++) g(i + 0.5); %OptimizeFunctionOnNextCall(g); g(1.5); }
