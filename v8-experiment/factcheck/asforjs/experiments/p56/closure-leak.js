// Does a returned closure retain a big array it does not use? node --expose-gc closure-leak.js
const MB = (x) => (x / 1048576).toFixed(1) + ' MB';
function used() { gc(); gc(); return process.memoryUsage().heapUsed; }
function a_unused() { const arr = new Array(1e6).fill(1.5); let s = 1; return () => s; }
function b_indexed() { const arr = new Array(1e6).fill(1.5); return () => arr[10]; }
function c_sibling() { const arr = new Array(1e6).fill(1.5); let s = 1;
  const helper = () => arr.length; helper(); return () => s; }   // helper is dropped
function d_nulled() { let arr = new Array(1e6).fill(1.5); const f = () => arr && arr[10]; arr = null; return f; }
const keep = [];
for (const [name, mk] of Object.entries({a_unused, b_indexed, c_sibling, d_nulled})) {
  const u0 = used(); for (let i = 0; i < 10; i++) keep.push(mk()); const u1 = used();
  console.log(name.padEnd(10), '10 closures retain +' + MB(u1 - u0));
}
