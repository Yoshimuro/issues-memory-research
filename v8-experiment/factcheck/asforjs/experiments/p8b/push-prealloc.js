// push vs new Array(n)+index write vs Array.from({length:n}) + index write
const print = globalThis.print || console.log;
function viaPush(n) { const a = []; for (let i = 0; i < n; i++) a.push(i); return a; }
function viaNewArray(n) { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = i; return a; }
function viaFrom(n) { const a = Array.from({length: n}); for (let i = 0; i < n; i++) a[i] = i; return a; }
function viaFill(n) { const a = new Array(n).fill(0); for (let i = 0; i < n; i++) a[i] = i; return a; }
const n = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 10000);
const R = +((globalThis.arguments && globalThis.arguments[1]) || (typeof process !== 'undefined' && process.argv[3]) || 2000);
for (let rep = 0; rep < 3; rep++) { const out = []; for (const f of [viaPush, viaNewArray, viaFrom, viaFill]) { const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c += f(n).length; out.push(f.name + '=' + (Date.now() - t) + 'ms'); } print('rep' + rep + ' ' + out.join(' ')); }
