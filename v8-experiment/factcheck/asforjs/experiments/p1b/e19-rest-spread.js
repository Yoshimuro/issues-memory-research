// Rest function called with spread arrays of fixed vs varying length: is it inlined?
const log = typeof console !== 'undefined' ? console.log : print;
const mode = (typeof process !== 'undefined' ? process.argv[2] : arguments[0]) || 'fixed';
function sumRest(...xs) { let s = 0; for (let i = 0; i < xs.length; i++) s += xs[i]; return s; }
function callSpread(a) { return sumRest(...a); }
function callDirect3(x, y, z) { return sumRest(x, y, z); }
const arrays = mode === 'fixed' ? [[1, 2, 3]] : Array.from({ length: 8 }, (_, k) => Array.from({ length: k + 1 }, (_, i) => i));
let t = 0;
for (let k = 0; k < 20000; k++) { t += callSpread(arrays[k % arrays.length]); t += callDirect3(k, 1, 2); }
log(`${mode}: callSpread=${%GetOptimizationStatus(callSpread).toString(2)} callDirect3=${%GetOptimizationStatus(callDirect3).toString(2)} sumRest=${%GetOptimizationStatus(sumRest).toString(2)} t=${t}`);
