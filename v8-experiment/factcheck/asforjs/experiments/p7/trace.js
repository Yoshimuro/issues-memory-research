const log = typeof print === 'function' ? print : console.log;
function doAdd(o) { return o.x + 1; }
function doLoop(n) { let s = 0; for (let i = 0; i < n; i++) s += i & 7; return s; }
let r = 0;
for (let i = 0; i < 200000; i++) r += doAdd({ x: i });
r += doAdd({ y: 1, x: 2 }); // map change -> deopt (wrong map)
r += doLoop(3e7);           // OSR
r += doLoop(3e7);           // second call: OSR cache / regular opt
log(r);
