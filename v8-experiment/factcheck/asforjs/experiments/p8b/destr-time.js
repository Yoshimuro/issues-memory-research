// compare array destructuring vs object pattern; optimized (default) and with --no-opt/--no-maglev/--no-sparkplug (interp)
const print = globalThis.print || console.log;
function arrPat(arr) { const [a, b, c] = arr; return a + b + c; }
function objPat(arr) { const {0: a, 1: b, 2: c} = arr; return a + b + c; }
function idx(arr) { const a = arr[0], b = arr[1], c = arr[2]; return a + b + c; }
const data = []; for (let i = 0; i < 1000; i++) data.push([i, i + 1, i + 2]);
function run(f, n) { let s = 0; for (let k = 0; k < n; k++) for (let i = 0; i < 1000; i++) s = (s + f(data[i])) & 0xffffff; return s; }
const N = +(globalThis.arguments && globalThis.arguments[0] || (typeof process!=='undefined' && process.argv[2]) || 3000);
for (let rep = 0; rep < 3; rep++) {
  const out = [];
  for (const f of [arrPat, objPat, idx]) { const t = Date.now(); const s = run(f, N); out.push(f.name + '=' + (Date.now() - t) + 'ms'); }
  print('rep' + rep + ' ' + out.join(' '));
}
