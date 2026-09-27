// Does a HeapNumber-valued result come back as Smi when the value fits? interpreter vs optimized tiers
const log = typeof print === 'function' ? print : console.log;
function sub(a, b) { return a - b; }
function mul(a, b) { return a * b; }
const big = 2 ** 40, h = 0.5;
// warm with doubles so feedback = Number
for (let i = 0; i < 20; i++) { sub(big + i, 2.5); mul(h, 3.5); }
log('interp sub(2**40, 2**40-5) isSmi', %IsSmi(sub(big, big - 5)));
log('interp mul(0.5, 8) isSmi', %IsSmi(mul(h, 8)));
%PrepareFunctionForOptimization(sub); %PrepareFunctionForOptimization(mul);
sub(big, 1.5); mul(h, 3.5);
%OptimizeFunctionOnNextCall(sub); %OptimizeFunctionOnNextCall(mul);
sub(big, 1.5); mul(h, 3.5);
log('sub optimized status', %GetOptimizationStatus(sub).toString(2));
log('opt sub(2**40, 2**40-5) =', sub(big, big - 5), 'isSmi', %IsSmi(sub(big, big - 5)));
log('opt mul(0.5, 8) =', mul(h, 8), 'isSmi', %IsSmi(mul(h, 8)));
log('opt sub(2**40, 2**40-0.5) isSmi', %IsSmi(sub(big, big - 0.5)));
log('sub optimized status after', %GetOptimizationStatus(sub).toString(2));
