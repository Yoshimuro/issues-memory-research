// Which elements transitions does --trace-elements-transitions report for push?
const log = (typeof console !== 'undefined') ? console.log : print;
log('--- A: top-level [1,2,3].push(1.5)');
const a = [1, 2, 3]; a.push(1.5);
log('--- B: [] then push ints then push double (interpreted fn)');
function fillB() { const arr = []; arr.push(1); arr.push(2); arr.push(2.5); return arr; }
fillB();
log('--- C: optimized pusher gets a double');
function pusher(arr, x) { arr.push(x); }
%PrepareFunctionForOptimization(pusher);
for (let i = 0; i < 10; i++) pusher([1, 2], i);
%OptimizeFunctionOnNextCall(pusher); pusher([1, 2], 3);
pusher([1, 2], 3.5);
log('--- D: store past the end a[5] = 1 on [1,2,3] then push 0.5');
const d = [1, 2, 3]; d[5] = 1; d.push(0.5);
log('--- E: arr.length = 10 on [1,2] then push 0.5');
const e = [1, 2]; e.length = 10; e.push(0.5);
log('--- end');
