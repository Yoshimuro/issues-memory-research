const print = globalThis.print || console.log;
function useBool(a) { let s = 0; for (let i = 0; i < a.length; i++) if (a[i] === true) s++; return s; }
function useInt(a) { let s = 0; for (let i = 0; i < a.length; i++) if (a[i] === 1) s++; return s; }
function ifBool(a) { let s = 0; for (let i = 0; i < a.length; i++) if (a[i]) s++; return s; }
function ifInt(a) { let s = 0; for (let i = 0; i < a.length; i++) if (a[i]) s++; return s; }
const ab = [], ai = []; for (let i = 0; i < 100000; i++) { ab.push(i % 3 === 0); ai.push(i % 3 === 0 ? 1 : 0); }
const R = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 3000);
for (let rep = 0; rep < 4; rep++) { const out = []; for (const [f, a] of [[useBool, ab], [useInt, ai], [ifBool, ab], [ifInt, ai]]) { const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c += f(a); out.push(f.name + '=' + (Date.now() - t) + 'ms'); } print('rep' + rep + ' ' + out.join(' ')); }
