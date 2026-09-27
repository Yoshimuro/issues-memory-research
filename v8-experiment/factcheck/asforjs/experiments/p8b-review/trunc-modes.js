// Math.trunc(x) vs x|0: соотношение в Ignition и в оптимизированном коде
const print = globalThis.print || console.log;
const N = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 2e7);
const data = new Float64Array(1024); for (let i = 0; i < 1024; i++) data[i] = i * 1.37 + 0.5;
function viaTrunc(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + Math.trunc(data[i & 1023])) & 0xffff; return s; }
function viaOr(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + (data[i & 1023] | 0)) & 0xffff; return s; }
for (let rep = 0; rep < 4; rep++) { const out = []; for (const f of [viaTrunc, viaOr]) { const t = Date.now(); const r = f(N); out.push(f.name + '=' + (Date.now() - t) + 'ms(' + r + ')'); } print('rep' + rep + ' ' + out.join(' ')); }
