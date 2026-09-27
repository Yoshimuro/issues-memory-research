// How long does a deopt itself take vs. a TurboFan compile of the same function?
const log = typeof print === 'function' ? print : console.log;
function add(a, b) { return a + b; }
%PrepareFunctionForOptimization(add); for (let i = 0; i < 100; i++) add(i, 1);
%OptimizeFunctionOnNextCall(add); add(1, 2);
add('a', 'b'); // eager deopt: not a Smi / not a String
log('done');
