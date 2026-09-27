// for vs forEach vs reduce: optimized (default) and fully unoptimized
const print = globalThis.print || console.log;
const arr = []; for (let i = 0; i < 1000; i++) arr.push(i);
function viaFor(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) & 0xffff; return s; }
function viaForEach(a) { let s = 0; a.forEach(x => { s = (s + x) & 0xffff; }); return s; }
function viaReduce(a) { return a.reduce((s, x) => (s + x) & 0xffff, 0); }
const R = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 40000);
for (let rep = 0; rep < 3; rep++) { const out = []; for (const f of [viaFor, viaForEach, viaReduce]) { const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c += f(arr); out.push(f.name + '=' + (Date.now() - t) + 'ms'); } print('rep' + rep + ' ' + out.join(' ')); }
