// Line 138: array of 40 000 random ints 0..100, sum via for and forEach, each called 1000 times, per tier (--max-opt)
const log = typeof print === 'function' ? print : console.log;
const now = () => performance.now();
const arr = Array.from({ length: 40000 }, () => Math.floor(Math.random() * 101));
function sumFor(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function sumForEach(a) { let s = 0; a.forEach(x => { s += x; }); return s; }
const which = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
const f = which === 'forEach' ? sumForEach : sumFor;
let t0 = now(), r = 0;
for (let k = 0; k < 1000; k++) r += f(arr);
log(`${which} ms=${(now() - t0).toFixed(0)}`);
