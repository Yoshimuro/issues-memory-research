// unbounded accumulator crossing the Smi range vs masked accumulator: deopts?
const print = globalThis.print || console.log;
function sumRaw(n) { let s = 0; for (let i = 0; i < n; i++) s += i; return s; }
function sumMasked(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + i) & 0xffff; return s; }
for (let k = 0; k < 5; k++) { print('raw ' + sumRaw(1e5)); print('masked ' + sumMasked(1e5)); }
