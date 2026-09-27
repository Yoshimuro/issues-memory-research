const log = typeof print === 'function' ? print : console.log;
function doSum(a) { let s = 0; for (const x of a) s += x; return s; }
log('fresh (declared, not called):', %GetOptimizationStatus(doSum));
%PrepareFunctionForOptimization(doSum); doSum([1, 2, 3]);
log('after Prepare+call:', %GetOptimizationStatus(doSum));
%OptimizeFunctionOnNextCall(doSum);     doSum([1, 2, 3]);
log('after OptimizeFunctionOnNextCall+call:', %GetOptimizationStatus(doSum));
function doM(a) { return a + 1; }
%PrepareFunctionForOptimization(doM); doM(1);
try { %OptimizeMaglevOnNextCall(doM); } catch (e) { log('err', e); }
doM(2);
log('after OptimizeMaglevOnNextCall+call:', %GetOptimizationStatus(doM));
function doN(a) { let s=0; for (let i=0;i<1e6;i++) s+= (i|0); return s; }
%NeverOptimizeFunction(doN);
for (let i=0;i<30;i++) doN(i);
log('NeverOptimize after 30 hot calls:', %GetOptimizationStatus(doN));
