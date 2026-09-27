// Type-change deopts: string among numbers, smi->double, smi overflow at 2^30 / 2^31
const log = typeof print === 'function' ? print : console.log;
function isOpt(f) { return (%GetOptimizationStatus(f) & 16) !== 0; } // bit4 = TurboFanned
function run(name, f, warm, probe) {
  %PrepareFunctionForOptimization(f);
  for (const a of warm) f(...a); for (const a of warm) f(...a);
  %OptimizeFunctionOnNextCall(f); f(...warm[0]);
  const before = isOpt(f);
  const r = f(...probe);
  log(`${name}: optimized_before=${before} after_probe=${isOpt(f)} result=${r}`);
}
function add1(a, b) { return a + b; }
run('string among numbers', add1, [[1,2],[3,4]], ['a','b']);
function add2(a, b) { return a + b; }
run('double among smi', add2, [[1,2],[3,4]], [1.5, 2]);
function add3(a, b) { return a + b; }
run('sum = 2^30 (smi inputs)', add3, [[1,2],[3,4]], [2**29, 2**29]);
function add4(a, b) { return a + b; }
run('sum = 2^31 (smi inputs, int32 overflow)', add4, [[1,2],[3,4]], [2**30-1, 2**30-1+2]);
function add5(a, b) { return a + b; }
run('input 2^30 (not smi on 31-bit)', add5, [[1,2],[3,4]], [2**30, 1]);
// identifier reuse: param reassigned to other type
function reuse(n) { const d = n * 2; n = String(n); return n.length + d; }
run('param reassigned to string (warm with it)', reuse, [[10],[200]], [3000]);
