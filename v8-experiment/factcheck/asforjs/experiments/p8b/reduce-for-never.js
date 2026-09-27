// %NeverOptimizeFunction on the functions containing for / reduce: which is faster, and does anything OSR?
const print = globalThis.print || console.log;
const arr = []; for (let i = 0; i < 1000; i++) arr.push(i);
function viaFor(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) & 0xffff; return s; }
const cb = (s, x) => (s + x) & 0xffff;
function viaReduce(a) { return a.reduce(cb, 0); }
%NeverOptimizeFunction(viaFor); %NeverOptimizeFunction(viaReduce);
const R = 20000;
for (let rep = 0; rep < 3; rep++) { const out = []; for (const f of [viaFor, viaReduce]) { const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c += f(arr); out.push(f.name + '=' + (Date.now() - t) + 'ms'); } print('rep' + rep + ' ' + out.join(' ')); }
print('cb status bits=' + %GetOptimizationStatus(cb).toString(2) + ' viaFor bits=' + %GetOptimizationStatus(viaFor).toString(2));
