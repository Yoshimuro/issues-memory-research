// Line 166: accumulator leaving the Smi range -> deopt/reopt; masking keeps it in int range
const isD8 = typeof process === 'undefined';
const log = isD8 ? print : console.log;
const mode = isD8 ? arguments[0] : process.argv[2];
const arr = Array.from({ length: 40000 }, (_, i) => (i * 7919) % 101);
let sum = 0;
function addAll(a) { for (let i = 0; i < a.length; i++) sum = sum + a[i]; }
function addAllMasked(a) { for (let i = 0; i < a.length; i++) sum = (sum + a[i]) & 0xFFFF; }
const f = mode === 'mask' ? addAllMasked : addAll;
const t0 = Date.now();
for (let k = 0; k < 2000; k++) f(arr);
log(`${mode} ms=${Date.now() - t0} sum=${sum}`);
