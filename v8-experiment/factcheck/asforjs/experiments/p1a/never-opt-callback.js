// Line 128: %NeverOptimizeFunction(doMain) does not prevent optimization of a callback defined inside doMain
const log = typeof print === 'function' ? print : console.log;
let cb;
function doMain(arr) { cb = (a, b) => a + b; let s = 0; for (let k = 0; k < 20000; k++) s += arr.reduce(cb, 0); return s; }
%NeverOptimizeFunction(doMain);
doMain([1, 2, 3, 4, 5, 6, 7, 8]);
log('doMain status=' + %GetOptimizationStatus(doMain).toString(2), 'callback status=' + %GetOptimizationStatus(cb).toString(2));
