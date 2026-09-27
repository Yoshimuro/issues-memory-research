// machine code for x/2|0, x/2, x%2, x&1 with Smi feedback
function divTrunc(x) { return (x / 2) | 0; }
function divPlain(x) { return x / 2; }
function mod2(x) { return x % 2; }
function and1(x) { return x & 1; }
for (const f of [divTrunc, divPlain, mod2, and1]) %PrepareFunctionForOptimization(f);
for (let i = 0; i < 100; i++) { divTrunc(i); divPlain(i); mod2(i); and1(i); }
for (const f of [divTrunc, divPlain, mod2, and1]) { %OptimizeFunctionOnNextCall(f); f(7); }
