// Are TDZ checks emitted per read or per distinct variable? (hole-check elision within a function)
function o1(){ let a = 1; function thrice(){ return a + a + a; } return thrice; }
function o2(){ let a = 1, b = 2, c = 3; function three(){ return a + b + c; } return three; }
function o3(){ let a = 1; function inLoop(n){ let s = 0; for (let i = 0; i < n; i++) s += a + a; return s; } return inLoop; }
function o4(){ let a = 1; function branchy(x){ let s = 0; if (x) s = a; return s + a; } return branchy; }
o1()(); o2()(); o3()(2); o4()(1);
