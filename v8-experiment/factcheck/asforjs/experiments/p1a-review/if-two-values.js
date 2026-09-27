// Line 160: "при вызовах с 1 и 2 остаются две проверки" — train doIf with 1 and 2, then optimize
const log = typeof print === 'function' ? print : console.log;
function doIf(x) { if (x === 1) return 10; if (x === 2) return 20; if (x === 3) return 30; return 0; }
%PrepareFunctionForOptimization(doIf);
for (let i = 0; i < 100; i++) { doIf(1); doIf(2); }
%OptimizeFunctionOnNextCall(doIf); doIf(1);
log('status=' + %GetOptimizationStatus(doIf).toString(2));
log('call(3) ->', doIf(3), 'status after=' + %GetOptimizationStatus(doIf).toString(2));
