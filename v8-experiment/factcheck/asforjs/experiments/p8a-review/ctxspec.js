// Immutable context slot folding depends on function-context specialization (only for a function with a single closure)
function makeOne() { const PI = 3.14; return function areaOne(r) { return PI * r * r; }; }
function makeMany() { const PI = 3.14; return function areaMany(r) { return PI * r * r; }; }
const one = makeOne();
const many = [makeMany(), makeMany(), makeMany()]; const m0 = many[0];
for (const f of [one, m0]) { %PrepareFunctionForOptimization(f); for (let i = 0; i < 50; i++) f(i + 0.5); %OptimizeFunctionOnNextCall(f); f(1.5); }
