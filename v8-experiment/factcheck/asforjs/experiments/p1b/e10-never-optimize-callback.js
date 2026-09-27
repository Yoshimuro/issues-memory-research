// %NeverOptimizeFunction(outer) does not stop the callback passed to forEach from being optimized.
const log = typeof console !== 'undefined' ? console.log : print;
const arr = Array.from({ length: 1000 }, (_, i) => i);
let total = 0;
const cb = (x) => { total += x; };
function outer() { arr.forEach(cb); }
%NeverOptimizeFunction(outer);
for (let k = 0; k < 5000; k++) outer();
log(`outer=${%GetOptimizationStatus(outer).toString(2)} cb=${%GetOptimizationStatus(cb).toString(2)}`);
