// Doc l.511/66: ({...rest}) does not deopt even for different input maps
const log = typeof print === 'function' ? print : console.log;
function f({...r}) { return r.a + r.b; }
function C(){ this.a = 1; this.b = 2; }
%PrepareFunctionForOptimization(f);
f({a: 1, b: 2}); f({a: 1, b: 2});
%OptimizeFunctionOnNextCall(f); f({a: 1, b: 2});
log('opt status bits after warmup', %GetOptimizationStatus(f).toString(2));
f(new C());                       // same key order, different prototype -> different input map
log('after ctor input', %GetOptimizationStatus(f).toString(2));
const o = {}; o.a = 1; o.b = 2;   // same order built dynamically
f(o);
log('after dynamic input', %GetOptimizationStatus(f).toString(2));
