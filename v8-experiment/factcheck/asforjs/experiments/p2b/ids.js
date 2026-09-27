function localVar(){ var p1 = 1; var p2 = 2; return p1 + p2; }
function localLet(){ let p1 = 1; let p2 = 2; return p1 + p2; }
function localConst(){ const p1 = 1; const p2 = 2; return p1 + p2; }
function noInit(){ var p; p = 5; return p; }
function sum(p1) { return function inner(p2) { return p1 + p2 } }
function blocks(){ { let a = 2; { let a = 3; { let a = 4; return a; } } } }
localVar(); localLet(); localConst(); noInit(); sum(1)(2); blocks();
