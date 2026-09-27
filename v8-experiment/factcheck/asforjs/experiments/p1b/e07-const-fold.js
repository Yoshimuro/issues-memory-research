// Claim: const PI = () => 3.14 is folded into a constant inside optimized computations.
const PI = () => 3.14;
function area(r) { return PI() * r * r; }
function run(n) { let s = 0; for (let i = 0; i < n; i++) s += area(i); return s; }
for (let k = 0; k < 3000; k++) run(100);
console.log(%GetOptimizationStatus(run).toString(2));
