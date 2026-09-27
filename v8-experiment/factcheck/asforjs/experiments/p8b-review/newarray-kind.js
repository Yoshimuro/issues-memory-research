const print = globalThis.print || console.log;
function kind(a){ return (%HasDictionaryElements(a)?'DICT':'') + (%HasSmiElements(a)?'SMI':'') + (%HasDoubleElements(a)?'DOUBLE':'') + (%HasObjectElements(a)?'OBJECT':'') + (%HasHoleyElements(a)?'/HOLEY':'/PACKED'); }
for (const n of [5, 1000, 100000, 1000000, 10000000]) {
  const a = new Array(n); const s1 = kind(a);
  for (let i = 0; i < n; i++) a[i] = i;
  print('new Array(' + n + '): ' + s1 + ' -> after fill by index: ' + kind(a));
}
const f = Array.from({length: 5}); print('Array.from({length:5}): ' + kind(f)); for (let i=0;i<5;i++) f[i]=i; print('  after ints: ' + kind(f));
const g = Array.from({length: 5}, (_, i) => i); print('Array.from({length:5}, fn): ' + kind(g));
const h = new Array(5).fill(0); print('new Array(5).fill(0): ' + kind(h));
