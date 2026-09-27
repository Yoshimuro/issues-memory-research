// d8: bytecode flushing by age (time-based in V8 15.6: --bytecode-old-time seconds)
function doRare(a) { let s = 0; for (let i = 0; i < a; i++) s += i; return s }
doRare(3);
const t0 = Date.now();
while (Date.now() - t0 < 3500) { gc(); for (let k = 0; k < 2e6; k++); }
%DebugPrint(doRare);
