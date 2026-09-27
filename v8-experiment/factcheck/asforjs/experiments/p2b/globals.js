var gv = 1; let gl = 2; const gc = 3;
function readG(){ return gv + gl + gc; }
function readConsole(){ return typeof console; }
function outerChain(){ let a = 1; return function mid(){ let b = 2; return function deep(){ return a + b; }; }; }
readG(); readConsole(); outerChain()()();
