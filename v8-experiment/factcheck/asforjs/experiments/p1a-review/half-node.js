// Line 117: x / 2 and x % 2 in TurboFan code on Node (no pointer compression, 32-bit Smi in upper half)
function half(x) { return x / 2; }
function mod2(x) { return x % 2; }
for (const f of [half, mod2]) { %PrepareFunctionForOptimization(f); for (let i = 0; i < 100; i++) f(2 * i); %OptimizeFunctionOnNextCall(f); f(4); }
