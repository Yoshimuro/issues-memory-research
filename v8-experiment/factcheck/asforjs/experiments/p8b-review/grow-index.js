// "прямая запись по индексу" в пустой [] (рост) vs push vs new Array(n)
const print = globalThis.print || console.log;
function viaPush(n) { const a = []; for (let i = 0; i < n; i++) a.push(i); return a; }
function viaGrowIndex(n) { const a = []; for (let i = 0; i < n; i++) a[i] = i; return a; }
function viaGrowLen(n) { const a = []; for (let i = 0; i < n; i++) a[a.length] = i; return a; }
function viaNewArray(n) { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = i; return a; }
const arg = (k, d) => +((globalThis.arguments && globalThis.arguments[k]) || (typeof process !== 'undefined' && process.argv[2 + k]) || d);
const n = arg(0, 10000), R = arg(1, 3000);
for (let rep = 0; rep < 4; rep++) {
  const out = [];
  for (const f of [viaPush, viaGrowIndex, viaGrowLen, viaNewArray]) {
    const t = Date.now(); let c = 0;
    for (let k = 0; k < R; k++) { const a = f(n); c += a[n - 1] + a.length; }
    out.push(f.name + '=' + (Date.now() - t) + 'ms');
  }
  print('rep' + rep + ' ' + out.join(' '));
}
