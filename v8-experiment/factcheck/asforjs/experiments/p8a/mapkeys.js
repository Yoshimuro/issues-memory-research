// Memory of Map with composite string keys vs numeric keys (SMI via bit ops / HeapNumber via multiplication)
const mode = process.argv[2]; const N = 1e6; const W = 1000;
gc(); const before = process.memoryUsage().heapUsed;
const m = new Map();
for (let i = 0; i < N; i++) {
  const a = (i / W) | 0, b = i % W;
  let key;
  if (mode === 'string') key = a + '-' + b;
  else if (mode === 'smi-bits') key = (a << 10) | b;          // stays SMI
  else if (mode === 'mul-small') key = a * 1000 + b;           // multiplication but small -> SMI
  else if (mode === 'mul-big') key = a * 1e10 + b;             // exceeds SMI range -> HeapNumber
  m.set(key, i);
}
gc(); const after = process.memoryUsage().heapUsed;
console.log(`${mode}: ${((after - before) / 1048576).toFixed(1)} MB for ${N} entries; sample key is SMI: ${%IsSmi(m.keys().next().value) } / last key SMI: ${%IsSmi([...m.keys()].pop())}`);
