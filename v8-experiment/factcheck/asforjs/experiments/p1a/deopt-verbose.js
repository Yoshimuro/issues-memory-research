// Line 162: --trace-deopt / --trace-deopt-verbose output; Maglev deopt "not a Smi"
function inc(x, lim) { let s = 0; for (let i = 0; i < lim; i++) s += x; return s; }
let r = 0;
for (let k = 0; k < 2000; k++) r += inc(1, 50);
r += inc('1', 3);
(typeof print === 'function' ? print : console.log)(String(r).length);
