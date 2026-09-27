// Line 164: each branch has its own feedback slot -> both stay monomorphic, no deopt
const log = typeof print === 'function' ? print : console.log;
function f(flag, x) { if (flag === 0) return x + 1; if (flag === 1) return x + '1'; return x; }
function g(x) { return x + 1; }   // same site sees number and string
%PrepareFunctionForOptimization(f); %PrepareFunctionForOptimization(g);
for (let i = 0; i < 100; i++) { f(0, i); f(1, i); g(i); g('s'); }
%OptimizeFunctionOnNextCall(f); %OptimizeFunctionOnNextCall(g); f(0, 1); g(1);
for (let i = 0; i < 1000; i++) { f(0, i); f(1, i); g(i); g('s'); }
log('f status=' + %GetOptimizationStatus(f).toString(2), 'g status=' + %GetOptimizationStatus(g).toString(2));
