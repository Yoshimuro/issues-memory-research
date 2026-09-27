// %OptimizeFunctionOnNextCall with/without %PrepareFunctionForOptimization; inlining of an unprepared inner function
const print = globalThis.print || console.log;
function innerA(x) { return x * 2 + 1; }
function outerA(x) { return innerA(x) + 1; }
function innerB(x) { return x * 2 + 1; }
function outerB(x) { return innerB(x) + 1; }
function lone(x) { return x + 1; }
// A: full protocol for outer only (inner never prepared, only called through outer)
%PrepareFunctionForOptimization(outerA); outerA(1); outerA(2); %OptimizeFunctionOnNextCall(outerA); outerA(3);
// B: no prepare at all
outerB(1); %OptimizeFunctionOnNextCall(outerB); outerB(2);
// lone: no prepare, then call with different type
lone(1); %OptimizeFunctionOnNextCall(lone); lone(2);
print('outerA status ' + %GetOptimizationStatus(outerA).toString(2));
print('outerB status ' + %GetOptimizationStatus(outerB).toString(2));
print('lone status ' + %GetOptimizationStatus(lone).toString(2));
