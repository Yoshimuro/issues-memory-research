// во сколько раз TurboFan быстрее Ignition на разных ядрах (ns/итерацию)
const print = globalThis.print || console.log;
const N = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 1e6);
function intLoop(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + i) | 0; return s; }
function pointAlloc(n) { let s = 0; for (let i = 0; i < n; i++) { const p = {x: i, y: i + 1}; s = (s + p.x * p.y) & 0xffff; } return s; }
function vecMath(n) { let s = 0; for (let i = 0; i < n; i++) { const a = [i, i + 1, i + 2]; s += Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]); } return s; }
function strCodes(n) { const str = 'abcdefghijklmnopqrstuvwxyz0123456789'; let s = 0; for (let i = 0; i < n; i++) s = (s + str.charCodeAt(i % 36)) & 0xffff; return s; }
function closures(n) { let s = 0; for (let i = 0; i < n; i++) { const f = (x) => x + i; s = (s + f(1)) & 0xffff; } return s; }
for (const f of [intLoop, pointAlloc, vecMath, strCodes, closures]) {
  let best = Infinity, r = 0;
  for (let rep = 0; rep < 5; rep++) { const t = performance.now(); r = f(N); best = Math.min(best, performance.now() - t); }
  print(f.name.padEnd(11) + ' ' + (best * 1e6 / N).toFixed(2) + ' ns/iter (' + r + ')');
}
