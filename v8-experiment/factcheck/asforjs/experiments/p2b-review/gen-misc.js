// Bytecode-generator behaviour across statements (doc 379, 408), for-loop layout (368), ternary vs if (364), sibling blocks (342).
function ifFalse(x){ if (false) { x = x * 100; console.log(x); } return x; }
function ifTrue(x){ if (true) { return x; } else { console.log(x); } return 0; }
function andTern(x){ return x & 1 ? x : 0; }
function modIf(x){ if (x % 2) return x; return 0; }
function modTern(x){ return x % 2 ? x : 0; }
function andIf(x){ if (x & 1) return x; return 0; }
function forLayout(n){ let s = 0; for (let i = 0; i < n; i++) { s += i; } return s; }
function siblings(){ { let a = 1; a++; } { let b = 2; b++; } return 0; }
function exprFold(){ return 2 * 3 + 4; }
function stmtNoFold(){ const k = 2 * 3; return k + 4; }
function strConcat(){ return 'a' + 'b'; }
ifFalse(1); ifTrue(1); andTern(1); modIf(1); modTern(1); andIf(1); forLayout(3); siblings(); exprFold(); stmtNoFold(); strConcat();
