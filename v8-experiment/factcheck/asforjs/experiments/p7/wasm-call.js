const log = typeof print === 'function' ? print : console.log;
const bytes = typeof readbuffer === 'function' ? readbuffer('loop.wasm') : require('fs').readFileSync(__dirname + '/loop.wasm');
const { add } = new WebAssembly.Instance(new WebAssembly.Module(bytes)).exports;
function jsAdd(a, b) { return (a + b) | 0; }
function doCallWasm(n) { let s = 0; for (let i = 0; i < n; i++) s = add(s, i & 7); return s; }
function doCallJs(n) { let s = 0; for (let i = 0; i < n; i++) s = jsAdd(s, i & 7); return s; }
const N = 1e8;
for (let rep = 0; rep < 3; rep++) {
  let t0 = Date.now(); const a = doCallWasm(N); const tw = Date.now() - t0;
  t0 = Date.now(); const b = doCallJs(N); const tj = Date.now() - t0;
  log('rep', rep, 'wasm-call ms', tw, 'js-call ms', tj, 'ratio', (tw / tj).toFixed(1), a === b);
}
