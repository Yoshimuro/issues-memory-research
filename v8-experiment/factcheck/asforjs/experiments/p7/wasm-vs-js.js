const N = 1e8;
const { loop } = new WebAssembly.Instance(new WebAssembly.Module(readbuffer('loop.wasm'))).exports;
function doLoop(n) { let s = 0; for (let i = 0; i < n; i = (i + 1) | 0) s = (s + (i & 7)) | 0; return s; }
let t0 = Date.now(); const rw = loop(N); const tw = Date.now() - t0;
t0 = Date.now(); const rj = doLoop(N); const tj = Date.now() - t0;
print('wasm ms', tw, 'js ms', tj, rw === rj);
