const log = typeof print === 'function' ? print : console.log;
const MODE = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
if (MODE === 'poison') Array.prototype[1000000] = 0;
const a = []; for (let i = 0; i < 1000; i++) a.push(i); a[500] = undefined; // packed
const h = new Array(1000); for (let i = 0; i < 1000; i += 2) h[i] = i; // holey
function sumHoley(arr){ let s = 0; for (let i = 0; i < arr.length; i++) { const v = arr[i]; if (v !== undefined) s += v; } return s; }
function pushPop(){ const x=[]; for (let i=0;i<100;i++) x.push(i); return x.length; }
for (let w=0; w<3000; w++) { sumHoley(h); pushPop(); }
let t=Date.now(); for (let w=0; w<20000; w++) sumHoley(h); const t1=Date.now()-t;
t=Date.now(); for (let w=0; w<20000; w++) pushPop(); const t2=Date.now()-t;
log(MODE, 'holeyRead ms', t1, 'push ms', t2);
