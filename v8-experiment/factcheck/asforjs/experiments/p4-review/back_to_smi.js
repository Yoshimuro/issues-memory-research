// Does an integral value that dropped back into Smi range get stored as Smi again?
// Interpreter only (function never optimized), value comes from a parameter (no constant folding)
function dec(x) { x--; return x; }
function sub(x, y) { return x - y; }
function addf(x, y) { return x + y; }
%NeverOptimizeFunction(dec); %NeverOptimizeFunction(sub); %NeverOptimizeFunction(addf);
const big = (typeof process !== 'undefined') ? 2 ** 31 : 2 ** 30; // first non-Smi
const print = (typeof console !== 'undefined') ? console.log : globalThis.print;
print('big=' + big);
%DebugPrint(big);
print('-- dec(big) (=big-1, fits Smi)'); %DebugPrint(dec(big));
print('-- sub(big, 1)'); %DebugPrint(sub(big, 1));
print('-- sub(big, big) + ... ->0'); %DebugPrint(sub(big, big));
print('-- addf(1.5, 1.5) =3'); %DebugPrint(addf(1.5, 1.5));
let v = big; v = v - 1; print('-- top-level v = v - 1'); %DebugPrint(v);
let w = 0.5; w = w * 4; print('-- top-level w = 0.5*4'); %DebugPrint(w);
