// bytecode size and speed: object-of-functions dispatch vs if-chain
const print = globalThis.print || console.log;
function fa() { return 1; } function fb() { return 2; } function fc() { return 3; }
const doThings = { a: fa, b: fb, c: fc };
function viaObject(arg) { return doThings[arg](); }
function viaIf(arg) { if (arg === 'a') return fa(); if (arg === 'b') return fb(); if (arg === 'c') return fc(); }
const keys = ['a', 'b', 'c'];
function run(f, n) { let s = 0; for (let i = 0; i < n; i++) s += f(keys[i % 3]); return s; }
const N = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 3e7);
for (let rep = 0; rep < 3; rep++) { const out = []; for (const f of [viaObject, viaIf]) { const t = Date.now(); const s = run(f, N); out.push(f.name + '=' + (Date.now() - t) + 'ms'); } print('rep' + rep + ' ' + out.join(' ')); }
