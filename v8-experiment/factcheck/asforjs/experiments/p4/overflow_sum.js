// integer accumulator crossing 2**30 and 2**31; mask variant stays small
function sumPlain(n, x) { let sum = 0; for (let i = 0; i < n; i++) { sum += x; } return sum; }
function sumMask(n, x) { let sum = 0; for (let i = 0; i < n; i++) { sum = (sum + x) & 0xFFFF; } return sum; }
const log = (typeof print === 'function') ? print : console.log;
log('plain', sumPlain(1e6, 40000));   // 4e10: crosses 2^30 and 2^31
log('plain2', sumPlain(1e6, 40000));
log('mask', sumMask(1e6, 40000));
