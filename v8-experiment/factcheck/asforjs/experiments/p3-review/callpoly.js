// Doc l.534: "2-3 different functions at a call site -> polymorphic variant, ~10 -> megamorphic, plain call"
const log = typeof print === 'function' ? print : console.log;
const N = +((typeof process !== 'undefined' ? process.argv[2] : arguments[0]) || 1);
function doConst7(){ return 7; } function doConst15(){ return 15; } function doConst3(){ return 3; }
const fns = [doConst7, doConst15, doConst3].slice(0, N);
function doThing(f){ return f() + 1; }
%PrepareFunctionForOptimization(doThing);
for (let i = 0; i < 30; i++) doThing(fns[i % N]);
%OptimizeFunctionOnNextCall(doThing);
doThing(fns[0]);
log('N=' + N + ' optimized=' + ((%GetOptimizationStatus(doThing) & 16) !== 0));
