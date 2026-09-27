function sum(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
const ints = [1, 2, 3, 4];
%PrepareFunctionForOptimization(sum); sum(ints); sum(ints); %OptimizeFunctionOnNextCall(sum); sum(ints);
sum([1.5, 'x', {}]);
