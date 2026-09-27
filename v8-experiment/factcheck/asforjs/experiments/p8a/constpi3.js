// let/var never reassigned vs const, vs let reassigned once: is 3.14 folded to an immediate?
const PIc = 3.14; let PIl = 3.14; var PIv = 3.14; let PIr = 1; PIr = 3.14;
const PIf = () => 3.14;
function aC(r) { return PIc * r * r; }
function aL(r) { return PIl * r * r; }
function aV(r) { return PIv * r * r; }
function aR(r) { return PIr * r * r; }
function aF(r) { return PIf() * r * r; }
for (const f of [aC, aL, aV, aR, aF]) { %PrepareFunctionForOptimization(f); for (let i = 0; i < 1000; i++) f(i + 0.5); %OptimizeFunctionOnNextCall(f); f(1.5); }
