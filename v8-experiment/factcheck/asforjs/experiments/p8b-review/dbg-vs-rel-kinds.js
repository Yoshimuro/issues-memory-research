// разные нагрузки: чистый числовой цикл (TurboFan), интерпретатор, аллокации, парсинг
const kind = globalThis.arguments[0];
function num(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + ((i * 7) ^ (i >>> 3))) & 0xffffff; return s; }
function alloc(n) { let s = 0; const a = []; for (let i = 0; i < n; i++) { a.push({x: i, y: String(i)}); s = (s + a[i].x + a[i].y.length) & 0xffffff; } return s; }
let t = Date.now(), r = 0;
if (kind === 'num') { for (let k = 0; k < 20; k++) r += num(2e7); }
if (kind === 'alloc') { for (let k = 0; k < 20; k++) r += alloc(2e5); }
if (kind === 'parse') { let src = ''; for (let i = 0; i < 20000; i++) src += 'function f' + i + '(a,b){ return a+b*' + i + '; }\n'; for (let k = 0; k < 5; k++) { r += (new Function(src + 'return 1;'))(); } }
print(kind + ' time=' + (Date.now() - t) + 'ms ' + r);
