// push (backing store grows by ~1.5x, old store copied and left as garbage) vs index-writes into a
// preallocated store vs a pure arithmetic loop doing the same "number work". Rounds alternate in one process.
const N = 5e6;
function viaPush() { const a = []; for (let i = 0; i < N; i++) a.push(i); return a.length; }
function viaPrealloc() { const a = new Array(N); for (let i = 0; i < N; i++) a[i] = i; return a.length; }
function numbersOnly() { let s = 0; for (let i = 0; i < N; i++) s = (s + i) | 0; return s; }
const fns = { viaPush, viaPrealloc, numbersOnly };
for (const f of Object.values(fns)) f();      // warm-up
const res = { viaPush: [], viaPrealloc: [], numbersOnly: [] };
for (let r = 0; r < 7; r++) for (const [n, f] of Object.entries(fns)) { const t = performance.now(); f(); res[n].push(performance.now() - t); }
for (const [n, arr] of Object.entries(res)) { arr.sort((a, b) => a - b); console.log(n.padEnd(12), 'median', arr[3].toFixed(1), 'ms  min', arr[0].toFixed(1), 'max', arr[6].toFixed(1)); }
