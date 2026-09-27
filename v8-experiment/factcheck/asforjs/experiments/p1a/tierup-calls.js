// Lines 113/122/130: at which call does a function reach Sparkplug / Maglev / TurboFan?
// Two functions: tiny (few bytes of bytecode) and one with an internal loop of 20 iterations.
const isD8 = typeof print === 'function' && typeof process === 'undefined';
const log = isD8 ? print : console.log;
// bit layout: V8 <= 13.6 (node) vs V8 15.6 (d8 here; kAlwaysOptimize removed, bits shifted by 1)
const B = isD8 ? { baseline: 1 << 14, maglev: 1 << 4, turbofan: 1 << 5 } : { baseline: 1 << 15, maglev: 1 << 5, turbofan: 1 << 6 };
function tiny(x) { return x + 1; }
function withLoop(x) { let s = 0; for (let i = 0; i < 20; i++) s += x + i; return s; }
function drive(f, name, N) {
  const seen = {}; let sink = 0;
  for (let i = 1; i <= N; i++) {
    sink += f(i & 1023);
    const st = %GetOptimizationStatus(f);
    for (const k in B) if (!seen[k] && (st & B[k])) seen[k] = i;
  }
  log(name.padEnd(9), JSON.stringify(seen), sink > 0);
}
%NeverOptimizeFunction(drive);
drive(tiny, 'tiny', 200000);
drive(withLoop, 'withLoop', 200000);
