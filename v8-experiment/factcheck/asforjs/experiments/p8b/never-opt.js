// What does %NeverOptimizeFunction cover? (bit layout of V8 11.3-13.6: 1 never,4 optimized,5 maglev,6 turbofan,7 interpreted,15 baseline)
const print = globalThis.print || console.log;
function bits(f) { const s = %GetOptimizationStatus(f); const n = []; for (const [b, nm] of [[1,'never'],[4,'optimized'],[5,'maglev'],[6,'turbofan'],[7,'interpreted'],[15,'baseline(sparkplug)']]) if (s & (1 << b)) n.push(nm); return n.join(',') || ('raw=' + s.toString(2)); }
function inner(x) { return (x * 3 + 1) & 0xffff; }
function harness(cb, n) { let s = 0; for (let i = 0; i < n; i++) s = (s + cb(i) + inner(i)) & 0xffffff; return s; }
const callback = x => (x ^ 7) & 0xff;
%NeverOptimizeFunction(harness);
let r = 0; for (let k = 0; k < 200; k++) r += harness(callback, 50000);
print('harness: ' + bits(harness));
print('inner (called from harness): ' + bits(inner));
print('callback (passed to harness): ' + bits(callback));
print(r);
