// (a) a function called once is never optimized; (b) deopt duration vs compile duration;
// (c) deopt triggered by mutating an object/prototype (code dependency), not by the optimized code itself.
const log = typeof console !== 'undefined' ? console.log : print;
function seven() { return 7 + 1; }
seven();
log(`seven called once: status=${%GetOptimizationStatus(seven).toString(2)}`);

// (b) natural tier-up then an eager deopt
function add(a, b) { return a + b; }
function hot(n) { let s = 0; for (let i = 0; i < n; i++) s = add(s, i) | 0; return s; }
for (let k = 0; k < 2000; k++) hot(100);
log(`hot: ${%GetOptimizationStatus(hot).toString(2)}`);
log('--- feeding a string (eager deopt)');
function hot2(n) { let s = ''; for (let i = 0; i < n; i++) s = add(s, 'x'); return s; }
hot2(3);
add('a', 'b'); hot(10);

// (c) dependency-based deopt: mutate a prototype after optimization
class P { get() { return 1; } }
function useP(p, n) { let s = 0; for (let i = 0; i < n; i++) s += p.get(); return s; }
const p = new P();
for (let k = 0; k < 3000; k++) useP(p, 100);
log(`useP: ${%GetOptimizationStatus(useP).toString(2)}`);
log('--- mutating P.prototype.get (no call of useP yet)');
P.prototype.get = function () { return 2; };
log(`useP right after mutation, before any call: ${%GetOptimizationStatus(useP).toString(2)}`);
useP(p, 1);
