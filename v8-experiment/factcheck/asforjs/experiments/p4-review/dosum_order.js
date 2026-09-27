// Float first, then integers: is there a "not a Smi" deopt?
function doSum(inc) { let sum = 0; for (let i = 0; i < 1e7; i++) { sum += inc; } return sum; }
const log = (typeof print === 'function') ? print : console.log;
log('r1', doSum(0.1)); log('r2', doSum(1)); log('r3', doSum(-1));
