const buf = readbuffer('loop.wasm');
print('readbuffer returns', Object.prototype.toString.call(buf));
const { loop, add } = new WebAssembly.Instance(new WebAssembly.Module(buf)).exports;
print(loop(10), add(2, 3));
