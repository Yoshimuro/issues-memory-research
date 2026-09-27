const log = typeof console !== 'undefined' ? console.log : print;
function once() { let s = 0; for (let i = 0; i < 3e7; i++) s = (s + i) | 0; return s; }
once(); // called exactly once
// callback: is it optimized "from the first iteration"?
const arr = Array.from({ length: 200000 }, (_, i) => i);
let calls = 0, firstOptAt = -1;
function cb(v) { calls++; if (firstOptAt < 0 && (%GetOptimizationStatus(cb) & 16)) firstOptAt = calls; return v & 1; }
arr.forEach(cb);
log('cb calls:', calls, 'first call seen running optimized (turbofan bit 4):', firstOptAt);
