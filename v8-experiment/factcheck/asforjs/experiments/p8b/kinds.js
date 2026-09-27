function kindOf(a) { return %HasSmiElements(a) ? (%HasHoleyElements(a) ? 'HOLEY_SMI' : 'PACKED_SMI') : %HasDoubleElements(a) ? (%HasHoleyElements(a) ? 'HOLEY_DOUBLE':'PACKED_DOUBLE') : (%HasHoleyElements(a) ? 'HOLEY_ELEMENTS' : 'PACKED_ELEMENTS'); }
const print = globalThis.print || console.log;
const a1 = Array.from({length: 5}); print('Array.from({length:5}) -> ' + kindOf(a1));
for (let i = 0; i < 5; i++) a1[i] = i; print('  after filling with ints -> ' + kindOf(a1));
const a2 = new Array(5); print('new Array(5) -> ' + kindOf(a2));
for (let i = 0; i < 5; i++) a2[i] = i; print('  after filling with ints -> ' + kindOf(a2));
const a3 = new Array(5).fill(0); print('new Array(5).fill(0) -> ' + kindOf(a3));
const a4 = Array.from({length: 5}, (_, i) => i); print('Array.from({length:5}, (_, i) => i) -> ' + kindOf(a4));
const a5 = []; for (let i = 0; i < 5; i++) a5.push(i); print('push -> ' + kindOf(a5));
// sum speed over PACKED_ELEMENTS (from Array.from) vs HOLEY_SMI (new Array) vs PACKED_SMI (push)
function sum(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) | 0; return s; }
function mk(kind, n) { if (kind === 'from') { const a = Array.from({length: n}); for (let i = 0; i < n; i++) a[i] = i; return a; } if (kind === 'new') { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = i; return a; } const a = []; for (let i = 0; i < n; i++) a.push(i); return a; }
const A = {from: mk('from', 1e6), new: mk('new', 1e6), push: mk('push', 1e6)};
function sumFrom() { return sum(A.from); }
for (let rep = 0; rep < 3; rep++) { const out = []; for (const k of ['from', 'new', 'push']) { const f = new Function('a', 'let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) | 0; return s;'); const t = Date.now(); let c = 0; for (let r = 0; r < 200; r++) c += f(A[k]); out.push(k + '=' + (Date.now() - t) + 'ms'); } print('sum rep' + rep + ' ' + out.join(' ')); }
