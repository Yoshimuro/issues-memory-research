// Does a sum crossing 2^30 (31-bit Smi limit in d8) or 2^31 (int32) deoptimize Smi-specialized code?
const log = typeof print === 'function' ? print : console.log;
// (a) loop accumulator in a register
function loopSum(n, step) { let s = 0; for (let i = 0; i < n; i++) s += step; return s; }
%PrepareFunctionForOptimization(loopSum); loopSum(100, 1); loopSum(100, 1); %OptimizeFunctionOnNextCall(loopSum); loopSum(100, 1);
log('--- loopSum crossing 2^30'); log(loopSum(3, 2 ** 29 - 1 + 1 /* 2^29 */));
log('--- loopSum crossing 2^31'); log(loopSum(5, 2 ** 29));
// (b) accumulator carried between calls (result fed back as argument)
function add(a, b) { return a + b; }
%PrepareFunctionForOptimization(add); add(1, 2); add(3, 4); %OptimizeFunctionOnNextCall(add); add(1, 2);
let acc = 2 ** 29;
log('--- add(2^29, 2^29) -> 2^30 result'); acc = add(acc, 2 ** 29); log(acc);
log('--- add(2^30, 1): 2^30 as input'); acc = add(acc, 1); log(acc);
log('--- done');
