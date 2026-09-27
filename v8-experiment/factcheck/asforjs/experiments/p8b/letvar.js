function withVar(n) { var s = 0; for (var i = 0; i < n; i++) s += i; return s; }
function withLet(n) { let s = 0; for (let i = 0; i < n; i++) s += i; return s; }
function withConst(n) { const k = 3; let s = 0; for (let i = 0; i < n; i++) s += i * k; return s; }
function withVarK(n) { var k = 3; var s = 0; for (var i = 0; i < n; i++) s += i * k; return s; }
function closVar() { var x = 1; return () => x; }
function closLet() { let x = 1; return () => x; }
withVar(3); withLet(3); withConst(3); withVarK(3); closVar()(); closLet()();
