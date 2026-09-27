// builds loop.wasm: export loop(n): sum of (i & 7) for i<n ; export add(a,b)
const fs = require('fs');
const sec = (id, bytes) => [id, bytes.length, ...bytes];
const str = s => [s.length, ...Buffer.from(s)];
const types = sec(1, [2, 0x60, 1, 0x7f, 1, 0x7f, 0x60, 2, 0x7f, 0x7f, 1, 0x7f]);
const funcs = sec(3, [2, 0, 1]);
const exps = sec(7, [2, ...str('loop'), 0, 0, ...str('add'), 0, 1]);
const loopBody = [1, 2, 0x7f,
  0x02, 0x40, 0x03, 0x40,
  0x20, 1, 0x20, 0, 0x4e, 0x0d, 1,
  0x20, 2, 0x20, 1, 0x41, 7, 0x71, 0x6a, 0x21, 2,
  0x20, 1, 0x41, 1, 0x6a, 0x21, 1,
  0x0c, 0, 0x0b, 0x0b, 0x20, 2, 0x0b];
const addBody = [0, 0x20, 0, 0x20, 1, 0x6a, 0x0b];
const code = sec(10, [2, loopBody.length, ...loopBody, addBody.length, ...addBody]);
fs.writeFileSync(__dirname + '/loop.wasm', Buffer.from([0, 0x61, 0x73, 0x6d, 1, 0, 0, 0, ...types, ...funcs, ...exps, ...code]));
