// per-iteration cost of a few kernels; run once with default flags and once with --no-opt --no-maglev --no-sparkplug
const print = globalThis.print || console.log;
const arr = []; for (let i = 0; i < 1000; i++) arr.push(i);
const objs = []; for (let i = 0; i < 1000; i++) objs.push({x: i, y: i * 2});
function k1(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) & 0xffff; return s; }
function k2(o) { let s = 0; for (let i = 0; i < o.length; i++) s = (s + o[i].x * o[i].y) & 0xffff; return s; }
function k3(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + Math.trunc(i / 3)) & 0xffff; return s; }
const R = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 20000);
for (let rep = 0; rep < 3; rep++) { const out = []; for (const [nm, f] of [['sumArray', () => k1(arr)], ['objFields', () => k2(objs)], ['truncDiv', () => k3(1000)]]) { const t = Date.now(); for (let r = 0; r < R; r++) f(); out.push(nm + '=' + ((Date.now() - t) * 1e6 / (R * 1000)).toFixed(2) + 'ns/iter'); } print('rep' + rep + ' ' + out.join(' ')); }
