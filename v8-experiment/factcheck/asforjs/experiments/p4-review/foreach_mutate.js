// Does mutating the array inside its own forEach break optimization? Three variants, --trace-deopt
const log = (typeof print === 'function') ? print : console.log;
function inPlace(arr) { let s = 0; arr.forEach((x, i) => { arr[i] = (x + 1) & 0xff; s += x; }); return s; }   // same elements kind
function pushPop(arr) { let s = 0; arr.forEach((x, i) => { if (i === 0) { arr.push(x); arr.pop(); } s += x; }); return s; } // length changes back and forth
function kindChange(arr, k) { let s = 0; arr.forEach((x, i) => { if (i === k) arr[i] = 0.5; s += x; }); return s; }   // SMI -> DOUBLE inside the loop
const mk = () => Array.from({ length: 1000 }, (_, i) => i & 0xff);
for (let r = 0; r < 2000; r++) { inPlace(mk()); pushPop(mk()); kindChange(mk(), -1); }
log('--- warm done; now the kind-changing call');
kindChange(mk(), 500);
log('--- end');
