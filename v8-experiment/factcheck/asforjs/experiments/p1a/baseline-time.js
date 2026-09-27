// Lines 113/115/117/122-124: compile time per tier for a mid-size function (trace-opt prints "took a, b, c ms")
function work(arr, o) {
  let s = 0, m = -Infinity, cnt = 0;
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i];
    if (v > m) m = v;
    if ((v & 1) === 0) { s += v * 2; cnt++; } else { s -= v >> 1; }
    if (o.flag) s ^= o.k;
    switch (v % 4) { case 0: s += 1; break; case 1: s += 2; break; case 2: s += o.k; break; default: s -= 1; }
  }
  const res = { s, m, cnt, avg: cnt ? s / cnt : 0, name: o.name + ':' + cnt };
  res.list = arr.slice(0, 3).map(x => x + o.k);
  return res;
}
// Line 113/122: Sparkplug compile time (d8 only: %CompileBaseline), after a few interpreted calls
const arr = Array.from({ length: 100 }, (_, i) => i * 7 % 101);
const o = { flag: true, k: 3, name: 'n' };
for (let i = 0; i < 3; i++) work(arr, o);
const t0 = performance.now(); %CompileBaseline(work); const t1 = performance.now();
print('CompileBaseline(work) ms=' + (t1 - t0).toFixed(3), 'status bits=' + %GetOptimizationStatus(work).toString(2));
