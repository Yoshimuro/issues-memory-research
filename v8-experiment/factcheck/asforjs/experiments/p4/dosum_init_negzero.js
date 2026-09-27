// doSum with let sum = -0 ; calls doSum(1), doSum(-1), doSum(0.1)
function doSum(inc) { let sum = -0; for (let i = 0; i < 1e7; i++) { sum += inc; } return sum; }
const log = (typeof print === 'function') ? print : console.log;
const t0 = Date.now();
log('r1', doSum(1)); log('r2', doSum(-1)); log('r3', doSum(0.1));
log('ms', Date.now() - t0);
