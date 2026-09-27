// sloppy-mode (mapped) arguments object: is the function optimized and inlined naturally?
function sloppySum(a, b) { var s = 0; for (var i = 0; i < arguments.length; i++) s += arguments[i]; return s; }
function sloppyAlias(a) { arguments[0] = 5; return a; }       // mapped arguments alias the parameter
function caller(n) { var t = 0; for (var i = 0; i < n; i++) t += sloppySum(i, 1, 2) + sloppyAlias(i); return t; }
for (var k = 0; k < 3000; k++) caller(100);
console.log('caller', %GetOptimizationStatus(caller).toString(2), 'sloppySum', %GetOptimizationStatus(sloppySum).toString(2), 'sloppyAlias', %GetOptimizationStatus(sloppyAlias).toString(2), 'result', caller(3));
