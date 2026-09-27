// Accumulator that crosses 2^30 but stays below 2^31 (sum ends at 1.5e9), vs one crossing 2^31
function sum30(n, x) { let s = 0; for (let i = 0; i < n; i++) { s += x; } return s; }
const log = (typeof print === 'function') ? print : console.log;
log('warm', sum30(1e5, 1), sum30(1e5, 1), sum30(1e5, 1));
log('--- cross 2^30 only: 1e6 * 1500 = 1.5e9');
log('r', sum30(1e6, 1500));
log('--- cross 2^31: 1e6 * 3000 = 3e9');
log('r', sum30(1e6, 3000));
