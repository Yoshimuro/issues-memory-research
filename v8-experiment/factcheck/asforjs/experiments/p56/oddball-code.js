// TurboFan code for comparisons with true vs 1.
// <engine> --allow-natives-syntax --print-opt-code --print-opt-code-filter=cmpTrue (or cmpOne) oddball-code.js
function cmpTrue(x) { return x === true ? 10 : 20; }
function cmpOne(x) { return x === 1 ? 10 : 20; }
%PrepareFunctionForOptimization(cmpTrue); %PrepareFunctionForOptimization(cmpOne);
for (let i = 0; i < 100; i++) { cmpTrue(true); cmpTrue(false); cmpOne(1); cmpOne(0); }
%OptimizeFunctionOnNextCall(cmpTrue); cmpTrue(true);
%OptimizeFunctionOnNextCall(cmpOne); cmpOne(1);
