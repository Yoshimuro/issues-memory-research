// p1b-10: once() wrapper, called 2 times to create wrappers; each wrapper's
// result used 10000 times in a hot caller. What gets inlined?
const log = typeof console !== 'undefined' ? console.log : print;
function once(fn) {
  let done = false, r;
  return function onceWrapper() { if (!done) { done = true; r = fn(); } return r; };
}
const getA = once(() => 21);
const getB = once(() => 2);
function hot(n) { let s = 0; for (let i = 0; i < n; i++) s += getA() * getB(); return s; }
for (let k = 0; k < 2000; k++) hot(100);
const bits = (f) => %GetOptimizationStatus(f).toString(2);
log('once status', bits(once), 'hot status', bits(hot), 'getA status', bits(getA));
