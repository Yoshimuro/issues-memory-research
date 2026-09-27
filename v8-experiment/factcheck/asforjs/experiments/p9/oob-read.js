const log = typeof console !== 'undefined' ? console.log : print;
const a = [1, 2, 3];
function sum(arr, n) { let s = 0; for (let i = 0; i < n; i++) { const v = arr[i]; if (v !== undefined) s += v; } return s; }
log('before: holey=', %HasHoleyElements(a), 'smi=', %HasSmiElements(a));
%PrepareFunctionForOptimization(sum);
for (let k = 0; k < 5; k++) sum(a, 3);
%OptimizeFunctionOnNextCall(sum);
sum(a, 3);
log('opt status after in-bounds opt (bit4=turbofan):', (%GetOptimizationStatus(sum) >> 4) & 1);
sum(a, 4); // out-of-bounds read
log('after OOB read: holey=', %HasHoleyElements(a), 'smi=', %HasSmiElements(a), 'turbofan still=', (%GetOptimizationStatus(sum) >> 4) & 1);
