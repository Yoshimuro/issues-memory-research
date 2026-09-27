// monomorphic call sites: separate loop per callee (JS may be inlined; JS->wasm call may be inlined wrapper)
const print = globalThis.print || console.log;
const bytes = new Uint8Array([0x00,0x61,0x73,0x6d,0x01,0x00,0x00,0x00, 0x01,0x07,0x01,0x60,0x02,0x7f,0x7f,0x01,0x7f, 0x03,0x02,0x01,0x00, 0x07,0x07,0x01,0x03,0x61,0x64,0x64,0x00,0x00, 0x0a,0x09,0x01,0x07,0x00,0x20,0x00,0x20,0x01,0x6a,0x0b]);
const wadd = new WebAssembly.Instance(new WebAssembly.Module(bytes)).exports.add;
function jadd(a, b) { return (a + b) | 0; }
function runJ(n) { let s = 0; for (let i = 0; i < n; i++) s = jadd(s, i) & 0xffffff; return s; }
function runW(n) { let s = 0; for (let i = 0; i < n; i++) s = wadd(s, i) & 0xffffff; return s; }
const N = 5e7;
for (let rep = 0; rep < 3; rep++) { const out = []; for (const [nm, f] of [['js', runJ], ['wasm', runW]]) { const t = Date.now(); const s = f(N); out.push(nm + '=' + (Date.now() - t) + 'ms(' + s + ')'); } print('rep' + rep + ' ' + out.join(' ')); }
