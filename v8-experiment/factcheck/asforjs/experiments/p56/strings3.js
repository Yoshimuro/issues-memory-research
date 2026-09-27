// Misc string checks (node --allow-natives-syntax --expose-gc strings3.js)
const fs = require('fs'); const out = (s) => fs.writeSync(1, s + '\n');
function p(label, s) { out('=== ' + label); %DebugPrint(s); }
p("'café' (Latin-1 é = U+00E9)", 'café');
p("'ÿ' U+00FF", 'ÿ');
p("'Ā' U+0100", 'Ā');
p("'CD'", 'CD'); p("'ABCD'", 'ABCD');
p('Buffer 2MB .toString(latin1)', Buffer.alloc(2e6, 97).toString('latin1').length > 0 ? Buffer.alloc(2e6, 97).toString('latin1') : 0);
let s = ''; for (let i = 0; i < 20; i++) s += 'x'; p("s += 'x' x20 in loop", s);
const MB = (x) => (x / 1048576).toFixed(2) + ' MB';
function used() { gc(); gc(); return process.memoryUsage().heapUsed; }
const h = {};
h.a = 'a'.repeat(1 << 20); h.b = 'b'.repeat(2 << 20); h.a.indexOf('z'); h.b.indexOf('z');
let u0 = used(); h.c = h.a + h.b; let u1 = used(); out('1MB + 2MB concat: heap +' + MB(u1 - u0));
h.d = h.c + h.a; let u2 = used(); out('third part added: heap +' + MB(u2 - u1));
h.c.charCodeAt(5); let u3 = used(); out('after first char read of the cons (flatten): heap +' + MB(u3 - u2));
h.e = h.b.slice(1000, 1000 + (1 << 19)); let u4 = used(); out('slice 512KB of 2MB: heap +' + MB(u4 - u3));
h.b = null; h.c = null; h.d = null; let u5 = used(); out('drop parent refs but keep slice: heap change ' + MB(u5 - u4) + ' (parent kept alive by SlicedString?)');
