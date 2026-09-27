// p9-02: does Node (no pointer compression) ever use shr 32 (logical) for Smi untagging, or only sar 32?
function t(a) { return Math.trunc(a / 3); }
function o(a) { return (a / 3) | 0; }
function arrsum(arr) { let s = 0; for (let i = 0; i < arr.length; i++) s += arr[i]; return s; }
const arr = [1, 2, 3, 4, 5, 6, 7, 8];
for (const f of [t, o]) { %PrepareFunctionForOptimization(f); for (let i = 0; i < 100; i++) f(i); %OptimizeFunctionOnNextCall(f); f(7); }
%PrepareFunctionForOptimization(arrsum); arrsum(arr); arrsum(arr); %OptimizeFunctionOnNextCall(arrsum); arrsum(arr);
