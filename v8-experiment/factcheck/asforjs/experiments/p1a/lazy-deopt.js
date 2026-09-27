// Line 164: is deopt only at the moment the optimized instruction sees other data? Code dependencies invalidate code at the moment of the change.
const log = typeof print === 'function' ? print : console.log;
const P = { m() { return 1; } };
const o = Object.create(P);
function callIt(x) { return x.m(); }
%PrepareFunctionForOptimization(callIt);
for (let i = 0; i < 100; i++) callIt(o);
%OptimizeFunctionOnNextCall(callIt); callIt(o);
log('optimized, status=' + %GetOptimizationStatus(callIt).toString(2));
log('--- changing P.m now (callIt is NOT running) ---');
P.m = function () { return 2; };
log('after change, before any call: status=' + %GetOptimizationStatus(callIt).toString(2));
log('call ->', callIt(o));
