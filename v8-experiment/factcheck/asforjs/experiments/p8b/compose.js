// function composition via reduce vs for-loop over fns vs direct nested calls
const print = globalThis.print || console.log;
const f1 = x => x + 1, f2 = x => x * 2, f3 = x => x - 3, f4 = x => x ^ 5, f5 = x => x & 0xffff;
const fns = [f1, f2, f3, f4, f5];
const viaReduce = x => fns.reduce((acc, f) => f(acc), x);
const viaFor = x => { let acc = x; for (let i = 0; i < fns.length; i++) acc = fns[i](acc); return acc; };
const direct = x => f5(f4(f3(f2(f1(x)))));
function run(g, n) { let s = 0; for (let i = 0; i < n; i++) s = (s + g(i)) & 0xfffffff; return s; }
const N = 2e7;
for (let rep = 0; rep < 3; rep++) { const out = []; for (const [name, g] of [['reduce', viaReduce], ['for', viaFor], ['direct', direct]]) { const t = Date.now(); const s = run(g, N); out.push(name + '=' + (Date.now() - t) + 'ms(' + s + ')'); } print('rep' + rep + ' ' + out.join(' ')); }
