// When does a tiny function get marked for TurboFan, and with which reason?
// The driver is never optimized (so tiny is not inlined into an OSR'd caller).
const log = typeof console !== 'undefined' ? console.log : print;
function tiny(x) { return x + 1; }
function driver() {
  let first = -1, st = 0;
  for (let i = 1; i <= 200000; i++) {
    tiny(i);
    st = %GetOptimizationStatus(tiny);
    // bits (11.3..13.6): 4 optimized, 8 marked, 9 marked concurrent, 10 optimizing concurrently
    if (st & ((1 << 4) | (1 << 8) | (1 << 9) | (1 << 10))) { first = i; break; }
  }
  log(`tiny: first marked/optimized after ${first} calls, status=${st.toString(2)}`);
}
%NeverOptimizeFunction(driver);
driver();
