function declVarNoInit(){ var p; return p; }
function declLetNoInit(){ let p; return p; }
function declVarNoInit2(){ var p; p = 5; return p; }
function doMainCtx(){ const theName = 1; function doInner(){ return theName; } return doInner(); }
function doMainParam(){ const theName = 1; function doInner2(n){ return n; } return doInner2(theName); }
function onlyCreated(){ let cache = 1; const f = () => cache; return 5; }
const fe = function selfRef(){ return selfRef; };
function outerVar(){ var x = 1; return function readVar(){ return x; }; }
function outerVarAssigned(){ var x = 1; x = 2; return function readVar2(){ return x; }; }
function outerParamAssigned(p){ p = p + 1; return function readP(){ return p; }; }
function outer3(){ var vv = 1; let vl = 2; const vc = 3; return function add3(){ return vv + vl + vc; }; }
function sameBlockLet(){ let x = 1; return x + 1; }
function copyLocal(){ let n = 10; return function loopCopy(){ const m = n; let s = 0; for (let i = 0; i < m; i++) s += i; return s; }; }
function noCopy(){ let n = 10; return function loopNoCopy(){ let s = 0; for (let i = 0; i < n; i++) s += i; return s; }; }
function shadowTdz(){ let p2 = 1; { try { p2; } catch(e){} let p2 = 2; return p2; } }
function beforeDecl(){ try { x; } catch(e){} let x = 1; return x; }
function switchTdz(v){ switch(v){ case 0: let x = 1; return x; case 1: return x; } }
function loopTdz(){ let s=0; for (let i=0;i<3;i++){ s+=i; } return s; }
function blockCapture(){ { let a = 2; return () => a; } }
declVarNoInit(); declLetNoInit(); declVarNoInit2(); doMainCtx(); doMainParam(); onlyCreated(); fe(); outerVar()(); outerVarAssigned()(); outerParamAssigned(1)(); outer3()(); sameBlockLet(); copyLocal()(); noCopy()(); shadowTdz(); beforeDecl(); switchTdz(0); try{switchTdz(1)}catch(e){} loopTdz(); blockCapture()();
