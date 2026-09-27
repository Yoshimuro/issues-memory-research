// Lines 146-154 (+ summary item 10, line 37): OSR + reduce callback from different environments.
// Usage: d8 osr-bug.js -- <variant> <n> [opt]   |  node osr-bug.js <variant> <n> [opt]
const isD8 = typeof process === 'undefined';
const log = isD8 ? print : console.log;
const argv = isD8 ? arguments : process.argv.slice(2);
const variant = argv[0], N = +argv[1], mode = argv[2] || 'plain';
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
function doOuter(a, b) { return a + b; }
var doOuterVar = function (a, b) { return a + b; };
const doOuterConst = function (a, b) { return a + b; };
const outerArrow = (a, b) => a + b;
const V = {
  literal(n) { let s = 0; while (n--) s += arr.reduce((a, b) => a + b, 0); return s; },
  inner(n) { function doInner(a, b) { return a + b; } let s = 0; while (n--) s += arr.reduce(doInner, 0); return s; },
  globalFn(n) { let s = 0; while (n--) s += arr.reduce(doOuter, 0); return s; },
  aliasInside(n) { var doInner = doOuter; let s = 0; while (n--) s += arr.reduce(doInner, 0); return s; },
  globalVar(n) { let s = 0; while (n--) s += arr.reduce(doOuterVar, 0); return s; },
  globalConst(n) { let s = 0; while (n--) s += arr.reduce(doOuterConst, 0); return s; },
  globalConstArrow(n) { let s = 0; while (n--) s += arr.reduce(outerArrow, 0); return s; },
  // workaround from line 154: loop body in a small local function
  innerWrapped(n) { function doInner(a, b) { return a + b; } function doSum() { return arr.reduce(doInner, 0); } let s = 0; while (n--) s += doSum(); return s; },
  constArrowWrapped(n) { function doSum() { return arr.reduce(outerArrow, 0); } let s = 0; while (n--) s += doSum(); return s; },
};
const doMain = V[variant];
if (mode === 'opt') { %PrepareFunctionForOptimization(doMain); doMain(3); doMain(3); %OptimizeFunctionOnNextCall(doMain); }
const t0 = Date.now();
const r = doMain(N);
log(`${variant.padEnd(18)} mode=${mode} n=${N} ms=${Date.now() - t0} r=${r}`);
