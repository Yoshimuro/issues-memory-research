const buf = typeof readbuffer === 'function' ? readbuffer('loop.wasm') : require('fs').readFileSync(__dirname + '/loop.wasm');
const { loop } = new WebAssembly.Instance(new WebAssembly.Module(buf)).exports;
(typeof print === 'function' ? print : console.log)(loop(1000));
