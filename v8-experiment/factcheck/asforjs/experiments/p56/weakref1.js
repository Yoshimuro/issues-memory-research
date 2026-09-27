// Does WeakRef keep its target while memory is plentiful ("hold if you can")?
// node --expose-gc weakref1.js
let ref = new WeakRef({ payload: new Array(1000).fill(1) });
const wm = new WeakMap(); let key = {}; wm.set(key, new Array(1000).fill(2));
console.log('same turn, before gc: deref =', typeof ref.deref());
setTimeout(() => {
  gc();                                        // heap is tiny, no memory pressure at all
  console.log('next task, after one gc(): deref =', typeof ref.deref());
  key = null; gc();
  console.log('WeakMap: value is reachable only via key; key dropped -> entry collectable (no API to observe size)');
}, 0);
