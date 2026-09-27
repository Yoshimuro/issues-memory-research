// sum of 40000 numbers, 1000 calls; variant from argv
const log = typeof print === 'function' ? print : console.log;
const variant = (typeof process !== 'undefined') ? process.argv[2] : arguments[0];
const a = Array.from({ length: 40000 }, (_, i) => i);
function doFor(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function doForEach(a) { let s = 0; a.forEach(x => { s += x; }); return s; }
const f = variant === 'for' ? doFor : doForEach;
const t0 = Date.now(); let r = 0;
for (let k = 0; k < 1000; k++) r += f(a);
log(variant, Date.now() - t0, 'ms', r);
