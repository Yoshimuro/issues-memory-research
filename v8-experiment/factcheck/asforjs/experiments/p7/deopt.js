function doAdd(o) { return o.x + 1; }
let r = 0;
for (let i = 0; i < 200000; i++) r += doAdd({ x: i });
r += doAdd({ y: 1, x: 2 });
