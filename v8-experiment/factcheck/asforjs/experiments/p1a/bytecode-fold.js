// Line 111: constant folding / dead code in bytecode generator; meaning of [N]
function fold() { return 7 + 2; console.log('dead'); }
function foldVar() { const a = 7; return a + 2; }
function getX(o) { return o.x; }
function addXY(a, b) { return a + b; }
fold(); foldVar(); getX({ x: 1 }); addXY(1, 2);
