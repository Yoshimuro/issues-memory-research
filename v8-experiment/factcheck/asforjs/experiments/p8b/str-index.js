// str[i] vs charCodeAt(i) in a hot loop
const print = globalThis.print || console.log;
const s = 'The quick brown fox jumps over the lazy dog 0123456789'.repeat(2000);
function byIndex(str) { let n = 0; for (let i = 0; i < str.length; i++) if (str[i] === 'o') n++; return n; }
function byCode(str) { let n = 0; for (let i = 0; i < str.length; i++) if (str.charCodeAt(i) === 111) n++; return n; }
const R = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 200);
for (let rep = 0; rep < 3; rep++) { const out = []; for (const f of [byIndex, byCode]) { const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c += f(s); out.push(f.name + '=' + (Date.now() - t) + 'ms(' + c + ')'); } print('rep' + rep + ' ' + out.join(' ')); }
