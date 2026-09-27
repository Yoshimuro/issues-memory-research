// Machine code of doSum with let sum = -0 after calls doSum(1), doSum(-1), doSum(0.1)
function doSum(inc) { let sum = -0; for (let i = 0; i < 1e6; i++) { sum += inc; } return sum; }
doSum(1); doSum(-1); doSum(0.1);
