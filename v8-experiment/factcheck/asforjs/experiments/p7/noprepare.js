const log = typeof print === 'function' ? print : console.log;
function doSum(a) { return a + 1; }
doSum(1);
%OptimizeFunctionOnNextCall(doSum);
doSum(2);
log('status without Prepare:', %GetOptimizationStatus(doSum));
function doSum2(a) { return a + 1; }
%OptimizeFunctionOnNextCall(doSum2);
doSum2(2);
log('status without any call before:', %GetOptimizationStatus(doSum2));
