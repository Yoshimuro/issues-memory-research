// Bytecode shapes for 8.1 / 8.5 claims
function closureOuter(n) {           // captured var -> CreateFunctionContext
  let acc = 0;
  const k = 3;
  function inner(i) { return i * k + acc; }
  for (let i = 0; i < n; i++) acc += inner(i);
  return acc;
}
function paramsOnly(n, k) { let s = 0; for (let i = 0; i < n; i++) s += i * k; return s; }
function blocksLet(a) {
  let x = 1;
  { let x = 2; a += x; { let x = 3; a += x; } }
  return a + x;
}
function forLet(n) { let s = 0; for (let i = 0; i < n; i++) s += i; return s; }
function forVar(n) { var s = 0; for (var i = 0; i < n; i++) s += i; return s; }
function whileLoop(n) { let s = 0; let i = 0; while (i < n) { s += i; i++; } return s; }
function letCaptured() { let v = 1; return function readLet() { return v; }; }
function constCaptured() { const v = 1; return function readConst() { return v; }; }
function varCaptured() { var v = 1; return function readVar() { return v; }; }
function letReassigned() { let v = 1; v = 2; return function readLetR() { return v; }; }
function loopLetCaptured(n) { const fs = []; for (let i = 0; i < n; i++) fs.push(() => i); return fs; }
function defaultParam(a = 1) { return a; }
function defaultParamClosure(a = 1) { var b = 2; return () => a + b; }
function defaultParamClosure2(a = 1) { var b = 2; return () => b; }
function andExpr(c, x) { c && x.f(); }
function ifStmt(c, x) { if (c) { x.f(); } }
function tern1(c, a, b) { return c ? g(a) : g(b); }
function tern2(c, a, b) { return g(c ? a : b); }
function g(x) { return x; }
function notLess(a, b) { return !(a < b); }
function geq(a, b) { return a >= b; }
function multiRet(x) { if (x > 0) return 1; if (x < 0) return -1; return 0; }
function switchRet(x) { switch (x) { case 1: return 'a'; case 2: return 'b'; default: return 'c'; } }
function isArrLoop(arr) { let c = 0; for (let i = 0; i < arr.length; i++) if (Array.isArray(arr[i])) c++; return c; }
function isArrCached(arr) { var isArray = Array.isArray; let c = 0; for (let i = 0; i < arr.length; i++) if (isArray(arr[i])) c++; return c; }
function thisX() { return this.x + this.x * this.x; }
function lit(o) { return o['prop'] + o.prop; }
function keyed(o, k) { return o[k]; }
function call0() { return g(); } function call1() { return g(1); } function call2() { return g(1,2); } function call3() { return g(1,2,3); }
function ctorFn(x, y) { this.x = x; this.y = y; }
class Cls { constructor(x, y) { this.x = x; this.y = y; } }
function zeroDot() { let s = 0.0; return s; }
function negZero() { let s = -0; return s; }
function argsFn() { return arguments[0] + arguments[1]; }
function restFn(...r) { return r[0] + r[1]; }
const all = [closureOuter, paramsOnly, blocksLet, forLet, forVar, whileLoop, letCaptured()(), constCaptured, varCaptured, letReassigned, loopLetCaptured, defaultParam, defaultParamClosure, defaultParamClosure2, andExpr, ifStmt, tern1, tern2, notLess, geq, multiRet, switchRet, isArrLoop, isArrCached, lit, keyed, call0, call1, call2, call3, zeroDot, negZero, argsFn, restFn];
closureOuter(3); paramsOnly(3,1); blocksLet(1); forLet(3); forVar(3); whileLoop(3);
letCaptured()(); constCaptured()(); varCaptured()(); letReassigned()(); loopLetCaptured(2);
defaultParam(); defaultParamClosure()(); defaultParamClosure2()(); andExpr(0,{f(){}}); ifStmt(0,{f(){}});
tern1(1,1,2); tern2(1,1,2); notLess(1,2); geq(1,2); multiRet(1); switchRet(1); isArrLoop([1]); isArrCached([1]);
thisX.call({x:1}); lit({prop:1}); keyed({a:1},'a'); call0(); call1(); call2(); call3(); new ctorFn(1,2); new Cls(1,2);
zeroDot(); negZero(); argsFn(1,2); restFn(1,2);
