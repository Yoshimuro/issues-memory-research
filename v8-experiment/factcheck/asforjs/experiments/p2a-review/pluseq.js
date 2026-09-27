function doLoopPlusEq(arr) { let sum = 0; for (let i = 0; i < arr.length; i++) { sum += arr[i] } return sum }
function doLoopPlusLong(arr) { let sum = 0; for (let i = 0; i < arr.length; i++) { sum = sum + arr[i] } return sum }
function doForOfPlusEq(arr) { let sum = 0; for (const x of arr) { sum += x } return sum }
function doForOfPlusLong(arr) { let sum = 0; for (const x of arr) { sum = sum + x } return sum }
var gsum = 0;
function doGlobalPlusEq(x) { gsum += x }
function doGlobalPlusLong(x) { gsum = gsum + x }
function doPropPlusEq(o, x) { o.sum += x }
function doPropPlusLong(o, x) { o.sum = o.sum + x }
function doClosure() { let s = 0; return function doInnerPlusEq(x) { s += x; return s } }
function doClosure2() { let s = 0; return function doInnerPlusLong(x) { s = s + x; return s } }
for (const f of [doLoopPlusEq, doLoopPlusLong, doForOfPlusEq, doForOfPlusLong]) f([1,2]);
doGlobalPlusEq(1); doGlobalPlusLong(1); doPropPlusEq({sum:0},1); doPropPlusLong({sum:0},1);
doClosure()(1); doClosure2()(1);
