function doSum(a) { return a + 1; }
function doAdd(a, b) { return a + b; }
function other(x) { return x * 2; }
function notCalled(x) { return x - 1; }
function predofix(x) { return x; }
doSum(1); doAdd(1,2); other(3); predofix(4);
