// цепочка map/filter/reduce vs один reduce vs for
const print = globalThis.print || console.log;
const arr = []; for (let i = 0; i < 1000; i++) arr.push(i);
function chain(a) { return a.map(x => x * 3).filter(x => (x & 1) === 0).reduce((s, x) => (s + x) & 0xffff, 0); }
function single(a) { return a.reduce((s, x) => { const y = x * 3; return (y & 1) === 0 ? (s + y) & 0xffff : s; }, 0); }
function loop(a) { let s = 0; for (let i = 0; i < a.length; i++) { const y = a[i] * 3; if ((y & 1) === 0) s = (s + y) & 0xffff; } return s; }
const R = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 50000);
for (let rep = 0; rep < 4; rep++) { const out = []; for (const f of [chain, single, loop]) { const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c = (c + f(arr)) & 0xffff; out.push(f.name + '=' + (Date.now() - t) + 'ms(' + c + ')'); } print('rep' + rep + ' ' + out.join(' ')); }
