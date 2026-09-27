// Claim: doThing(doConst7) is optimized for that exact function; doThing(doConst15) -> deopt;
// ~10 different functions -> megamorphic call site, generic call. Passing an object with a
// method "optimizes through property caches without deopts".
const log = typeof console !== 'undefined' ? console.log : print;
const mode = (typeof process !== 'undefined' ? process.argv[2] : (typeof arguments !== 'undefined' ? arguments[0] : 'fn')) || 'fn';
function doConst7() { return 7; }
function doConst15() { return 15; }
const many = Array.from({ length: 10 }, (_, k) => new Function(`return ${k};`));

function doThing(f) { let s = 0; for (let i = 0; i < 100; i++) s += f(); return s; }
function doThingObj(o) { let s = 0; for (let i = 0; i < 100; i++) s += o.run(); return s; }
class A { run() { return 7; } }
class B { run() { return 15; } }

function warm(fn, arg, n) { for (let i = 0; i < n; i++) fn(arg); }
const st = (f) => %GetOptimizationStatus(f).toString(2);
if (mode === 'fn') {
  warm(doThing, doConst7, 20000); log(`after doConst7 warmup: ${st(doThing)}`);
  log('--- switching to doConst15'); warm(doThing, doConst15, 20000); log(`after doConst15: ${st(doThing)}`);
  log('--- 10 different functions'); for (let r = 0; r < 3000; r++) for (const f of many) doThing(f);
  log(`after many: ${st(doThing)}`);
} else if (mode === 'objSameShape') {
  // same hidden class, different function values in the property
  warm(doThingObj, { run: doConst7 }, 20000); log(`after {run:doConst7}: ${st(doThingObj)}`);
  log('--- switching to {run:doConst15} (same map)'); warm(doThingObj, { run: doConst15 }, 20000); log(`after: ${st(doThingObj)}`);
} else if (mode === 'objClass') {
  warm(doThingObj, new A(), 20000); log(`after A: ${st(doThingObj)}`);
  log('--- switching to B (different map, method on prototype)'); warm(doThingObj, new B(), 20000); log(`after B: ${st(doThingObj)}`);
}
