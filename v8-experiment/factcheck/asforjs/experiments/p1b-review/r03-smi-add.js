// p1b-79: is Smi `c + 10` done as ONE add on the tagged value anywhere?
function addTen(c) { return c + 10; }
function addOne(c) { return c + 1; }
function loopTen(n) { let s = 0; for (let c = 0; c < n; c++) s = c + 10; return s; }
for (const f of [addTen, addOne]) { %PrepareFunctionForOptimization(f); for (let i = 0; i < 100; i++) f(i); }
%PrepareFunctionForOptimization(loopTen); loopTen(100);
if (typeof MODE !== 'undefined' && MODE === 'maglev') { %OptimizeMaglevOnNextCall(addTen); %OptimizeMaglevOnNextCall(addOne); %OptimizeMaglevOnNextCall(loopTen); }
else { %OptimizeFunctionOnNextCall(addTen); %OptimizeFunctionOnNextCall(addOne); %OptimizeFunctionOnNextCall(loopTen); }
addTen(5); addOne(5); loopTen(100);
