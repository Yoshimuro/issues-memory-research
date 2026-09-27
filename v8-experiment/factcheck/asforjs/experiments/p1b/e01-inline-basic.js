// Claim: test(v){return v+1} called in a loop is inlined; opt code shows "Inlined functions"
// and the add reduces to untag/+1/jo-deopt.
function test(v) { return v + 1; }
function run(n) { let s = 0; for (let i = 0; i < n; i++) s = test(s); return s; }
for (let k = 0; k < 200; k++) run(1000);
%PrepareFunctionForOptimization(run);
run(1000);
%OptimizeFunctionOnNextCall(run);
run(1000);
print_(`status(run)=${%GetOptimizationStatus(run).toString(2)}`);
function print_(s) { (typeof console !== 'undefined' ? console.log : print)(s); }
