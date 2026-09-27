// do generators / async functions get optimized by TurboFan?
const print = globalThis.print || console.log;
function* gen(n) { for (let i = 0; i < n; i++) yield i; }
async function af(x) { const y = await x; return y + 1; }
function sumGen() { let s = 0; for (const v of gen(100)) s += v; return s; }
%PrepareFunctionForOptimization(gen); %PrepareFunctionForOptimization(sumGen);
sumGen(); sumGen();
%OptimizeFunctionOnNextCall(gen); %OptimizeFunctionOnNextCall(sumGen);
sumGen();
print('gen status=' + %GetOptimizationStatus(gen).toString(2) + ' turbofanned(bit4)=' + !!(%GetOptimizationStatus(gen) & 16));
print('sumGen status=' + %GetOptimizationStatus(sumGen).toString(2) + ' turbofanned=' + !!(%GetOptimizationStatus(sumGen) & 16));
(async () => {
  %PrepareFunctionForOptimization(af);
  await af(1); await af(2);
  %OptimizeFunctionOnNextCall(af);
  await af(3);
  print('async af status=' + %GetOptimizationStatus(af).toString(2) + ' turbofanned=' + !!(%GetOptimizationStatus(af) & 16));
})();
