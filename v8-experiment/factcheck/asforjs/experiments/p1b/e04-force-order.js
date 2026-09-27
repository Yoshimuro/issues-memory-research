// Claim: forcing only the outer function via %OptimizeFunctionOnNextCall -> inner not inlined;
// forcing inner first (or both) -> inlined. Mechanism check: inner needs a feedback vector.
const log = typeof console !== 'undefined' ? console.log : print;
const mode = (typeof process !== 'undefined' ? process.argv[2] : arguments[0]) || 'outerOnly';
function inner(x) { return x * 2 + 1; }
function outer(x) { return inner(x) + 1; }
if (mode === 'outerOnly') {
  %PrepareFunctionForOptimization(outer); outer(1); %OptimizeFunctionOnNextCall(outer); outer(2);
} else if (mode === 'innerFirst') {
  %PrepareFunctionForOptimization(inner); inner(1); %OptimizeFunctionOnNextCall(inner); inner(2);
  %PrepareFunctionForOptimization(outer); outer(1); %OptimizeFunctionOnNextCall(outer); outer(2);
} else if (mode === 'outerWarm10') {
  // no forcing of inner, but inner is called enough times (>8) to get a feedback vector
  %PrepareFunctionForOptimization(outer); for (let i = 0; i < 10; i++) outer(i); %OptimizeFunctionOnNextCall(outer); outer(2);
} else if (mode === 'innerPrepOnly') {
  %PrepareFunctionForOptimization(inner);  // only allocates inner's feedback vector
  %PrepareFunctionForOptimization(outer); outer(1); %OptimizeFunctionOnNextCall(outer); outer(2);
}
log(`${mode}: outer=${%GetOptimizationStatus(outer).toString(2)} inner=${%GetOptimizationStatus(inner).toString(2)}`);
