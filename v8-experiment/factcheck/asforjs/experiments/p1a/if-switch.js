// Line 160 + summary item 7: unseen if-branches vs switch after optimization with feedback only for x=1
const log = typeof print === 'function' ? print : console.log;
function doIf(x) { if (x === 1) return 10; if (x === 2) return 20; if (x === 3) return 30; return 0; }
function doSwitch(x) { switch (x) { case 1: return 10; case 2: return 20; case 3: return 30; default: return 0; } }
for (const f of [doIf, doSwitch]) {
  %PrepareFunctionForOptimization(f);
  for (let i = 0; i < 100; i++) f(1);
  %OptimizeFunctionOnNextCall(f); f(1);
  log(f.name, 'optimized, status=' + %GetOptimizationStatus(f).toString(2));
  log(f.name, 'call(2) ->', f(2), 'status after=' + %GetOptimizationStatus(f).toString(2));
}
