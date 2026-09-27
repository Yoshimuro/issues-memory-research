// Line 138 (4th example): accumulator on outer let vs local let, with %NeverOptimizeFunction and without
const log = typeof print === 'function' ? print : console.log;
const now = () => performance.now();
const mode = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
let outerSum = 0, outerI = 0;
function sumOuter(n) { outerSum = 0; for (outerI = 0; outerI < n; outerI++) outerSum += outerI; return outerSum; }
function sumLocal(n) { let s = 0; for (let i = 0; i < n; i++) s += i; return s; }
if (mode === 'never') { %NeverOptimizeFunction(sumOuter); %NeverOptimizeFunction(sumLocal); }
for (let rep = 0; rep < 3; rep++) for (const f of [sumOuter, sumLocal]) { const t0 = now(); f(2e7); log(f.name, (now() - t0).toFixed(0)); }
