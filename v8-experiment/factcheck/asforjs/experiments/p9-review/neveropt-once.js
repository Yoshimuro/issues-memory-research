// p9-23: with %NeverOptimizeFunction, does code run only in Ignition, or does Sparkplug take over
// (a) for a function called many times, (b) for a function called ONCE with a long loop (baseline OSR)?
const log = typeof console !== 'undefined' ? console.log : print;
const B = { baseline: 1 << 15, topInterp: 1 << 16, topBaseline: 1 << 17, turbofan: 1 << 4 };
function bits(st) { return 'status=0x' + st.toString(16) + ' baseline=' + !!(st & B.baseline) + ' topInterp=' + !!(st & B.topInterp) + ' topBaseline=' + !!(st & B.topBaseline) + ' opt=' + !!(st & B.turbofan); }
function once(n) {
  let s = 0, first = null, last = null;
  for (let i = 0; i < n; i++) {
    s = (s + i * 3) | 0;
    if (i === 10) first = %GetOptimizationStatus(once);
    if (i === n - 1) last = %GetOptimizationStatus(once);
  }
  log('once: at i=10  ' + bits(first));
  log('once: at end   ' + bits(last));
  return s;
}
%NeverOptimizeFunction(once);
once(5e6);
function many(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + i) | 0; return %GetOptimizationStatus(many); }
%NeverOptimizeFunction(many);
let st0 = many(10), st;
for (let k = 0; k < 5000; k++) st = many(50);
log('many: 1st call ' + bits(st0));
log('many: 5000th   ' + bits(st));
