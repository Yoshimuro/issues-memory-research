const { loop } = new WebAssembly.Instance(new WebAssembly.Module(readbuffer('loop.wasm'))).exports;
let r = 0; for (let k = 0; k < 20; k++) r += loop(1e6);
print(r);
