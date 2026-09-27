// Same as back_to_smi.js but the function is optimized by TurboFan (Number feedback)
const print = (typeof console !== 'undefined') ? console.log : globalThis.print;
const big = (typeof process !== 'undefined') ? 2 ** 31 : 2 ** 30;
function dec(x) { x--; return x; }
%PrepareFunctionForOptimization(dec);
dec(big); dec(big + 0.5); dec(big);
%OptimizeFunctionOnNextCall(dec);
const r = dec(big);
print('status=' + (%GetOptimizationStatus(dec)).toString(2));
print('-- optimized dec(big)'); %DebugPrint(r);
// loop-carried variable: counts down from big across the Smi boundary, then printed
function down(n) { let x = n; for (let i = 0; i < 10; i++) x--; return x; }
%PrepareFunctionForOptimization(down); down(big + 5); down(big + 5.5);
%OptimizeFunctionOnNextCall(down); const r2 = down(big + 5);
print('-- optimized down(big+5) = big-5'); %DebugPrint(r2);
%NeverOptimizeFunction(down);
