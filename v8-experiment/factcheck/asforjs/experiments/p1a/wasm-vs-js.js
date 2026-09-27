// Summary item 2 (line 29): "+Maglev быстрее WASM" and line 117 WASM claims. Same loop in wasm and JS.
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const bytes = new Uint8Array([0,0x61,0x73,0x6d,1,0,0,0, 1,6,1,0x60,1,0x7f,1,0x7f, 3,2,1,0, 7,8,1,4,0x6c,0x6f,0x6f,0x70,0,0,
 0x0a,0x28,1,0x26, 1,2,0x7f, 2,0x40, 3,0x40, 0x20,1,0x20,0,0x4e,0x0d,1, 0x20,2,0x20,1,0x41,7,0x71,0x6a,0x21,2, 0x20,1,0x41,1,0x6a,0x21,1, 0x0c,0, 0x0b,0x0b, 0x20,2, 0x0b]);
const inst = new WebAssembly.Instance(new WebAssembly.Module(bytes));
function loop(n) { let s = 0; for (let i = 0; i < n; i++) { s = (s + (i & 7)) | 0; } return s; }
const N = 3e7;
let t0 = now(); let r1 = inst.exports.loop(N); let t1 = now();
log(`wasm time_ms=${(t1 - t0).toFixed(1)} r=${r1}`);
t0 = now(); let r2 = loop(N); t1 = now();
log(`js   time_ms=${(t1 - t0).toFixed(1)} r=${r2}`);
