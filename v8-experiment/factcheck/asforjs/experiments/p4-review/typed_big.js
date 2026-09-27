// Memory-bound case: sum over 3e7 small ints. PACKED_SMI Array (4 or 8 bytes/elt) vs Int8Array (1 byte) vs Int32Array (4 bytes)
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const N = 3e7;
const arr = Array.from({ length: N }, (_, i) => i & 127);
const i8 = new Int8Array(N), i32 = new Int32Array(N);
for (let i = 0; i < N; i++) { i8[i] = i & 127; i32[i] = i & 127; }
function sumArr(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) | 0; return s; }
function sumI8(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) | 0; return s; }
function sumI32(a) { let s = 0; for (let i = 0; i < a.length; i++) s = (s + a[i]) | 0; return s; }
sumArr(arr); sumI8(i8); sumI32(i32); sumArr(arr); sumI8(i8); sumI32(i32);
for (let r = 0; r < 5; r++) {
  let t = now(); sumArr(arr); const a = now() - t;
  t = now(); sumI8(i8); const b = now() - t;
  t = now(); sumI32(i32); const c = now() - t;
  log(`round ${r} smiArray=${a.toFixed(1)} Int8Array=${b.toFixed(1)} Int32Array=${c.toFixed(1)} smi/i8=${(a / b).toFixed(2)} smi/i32=${(a / c).toFixed(2)}`);
}
