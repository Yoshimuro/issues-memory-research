// doSum(1) x5, then doSum("1"): deopt + reopt; versus separate functions
function doSum(inc) { let sum = 0; for (let i = 0; i < 1e6; i++) sum += inc; return sum; }
for (let k = 0; k < 5; k++) doSum(1);
doSum("1").length;
