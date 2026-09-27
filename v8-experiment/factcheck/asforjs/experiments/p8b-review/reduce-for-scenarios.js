// Сценарии "без оптимизаций": что именно запрещено -> соотношение reduce/for
const print = globalThis.print || console.log;
const scen = (globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]);
const arr = []; for (let i = 0; i < 1000; i++) arr.push(i);
function viaFor(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) & 0xffff; return s; }
function cb(s, x) { return (s + x) & 0xffff; }
function viaReduce(a) { return a.reduce(cb, 0); }
if (scen === 'A') { %NeverOptimizeFunction(viaReduce); %NeverOptimizeFunction(cb); }          // for свободен (OSR), reduce+колбэк запрещены
if (scen === 'B') { %NeverOptimizeFunction(viaFor); %NeverOptimizeFunction(viaReduce); %NeverOptimizeFunction(cb); } // запрещено всё
if (scen === 'C') { %NeverOptimizeFunction(viaFor); %NeverOptimizeFunction(viaReduce); }      // как в стриме 1: колбэк свободен
const R = 20000;
for (let rep = 0; rep < 3; rep++) { const out = []; for (const f of [viaFor, viaReduce]) { const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c += f(arr); out.push(f.name + '=' + (Date.now() - t) + 'ms'); } print('scen ' + scen + ' rep' + rep + ' ' + out.join(' ')); }
