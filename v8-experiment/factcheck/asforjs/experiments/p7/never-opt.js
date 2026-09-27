const log = typeof print === 'function' ? print : console.log;
const args = typeof arguments !== 'undefined' ? arguments : process.argv.slice(2);
const never = args[0] === 'never';
function doTrunc(n) { let s = 0; for (let i = 0; i < n; i++) s += (i * 1.5) | 0; return s; }
let cb;
function doOuter(a) { let s = 0; a.forEach(cb = (x) => { s += x | 0; }); return s; }
if (never) { %NeverOptimizeFunction(doTrunc); %NeverOptimizeFunction(doOuter); }
const t0 = Date.now(); let r = 0;
for (let k = 0; k < 20; k++) r += doTrunc(5e6);
const t1 = Date.now();
const arr = Array.from({length: 1000}, (_, i) => i * 1.5);
for (let k = 0; k < 20000; k++) r += doOuter(arr);
log(never ? 'never' : 'default', 'doTrunc ms', t1 - t0, 'status doTrunc', %GetOptimizationStatus(doTrunc), 'doOuter', %GetOptimizationStatus(doOuter), 'callback', %GetOptimizationStatus(cb), r);
