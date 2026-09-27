// str[i] vs charCodeAt на one-byte и two-byte (кириллица) строках
const print = globalThis.print || console.log;
function mk(alpha, n) { let s = ''; for (let i = 0; i < n; i++) s += alpha[(i * 7) % alpha.length]; return s; }
const one = mk('abcdefghijklmnopqrstuvwxyz ', 1e5), two = mk('абвгдежзийклмнопрстуфхцчшщ ', 1e5);
function byIndex(s) { let c = 0; for (let i = 0; i < s.length; i++) { const ch = s[i]; if (ch === ' ') c++; else c = (c + ch.length) & 0xffff; } return c; }
function byCode(s) { let c = 0; for (let i = 0; i < s.length; i++) { const ch = s.charCodeAt(i); if (ch === 32) c++; else c = (c + 1) & 0xffff; } return c; }
function keyIndex(s, m) { for (let i = 0; i < s.length; i++) { const ch = s[i]; m[ch] = (m[ch] | 0) + 1; } return m; }
const R = +((globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]) || 300);
for (let rep = 0; rep < 4; rep++) { const out = []; for (const [nm, f, s] of [['idx-1byte', byIndex, one], ['code-1byte', byCode, one], ['idx-2byte', byIndex, two], ['code-2byte', byCode, two]]) { const t = Date.now(); let c = 0; for (let k = 0; k < R; k++) c += f(s); out.push(nm + '=' + (Date.now() - t) + 'ms'); } print('rep' + rep + ' ' + out.join(' ')); }
