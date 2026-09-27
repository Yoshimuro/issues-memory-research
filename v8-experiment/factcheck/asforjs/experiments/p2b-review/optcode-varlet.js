// Doc line 337: without NeverOptimize var and let are "доведены до одного машинного кода". Compare TurboFan code size.
function makeVar(){ var a = 1, b = 2, c = 3; function sumVar(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; } return sumVar; }
function makeLet(){ let a = 1, b = 2, c = 3; function sumLet(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; } return sumLet; }
// mutable outer vars (assigned elsewhere) -> no constant folding by context specialization
function makeVarM(){ var a = 1, b = 2, c = 3; function sumVarM(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; } function setVM(){ a = 1; } return [sumVarM, setVM]; }
function makeLetM(){ let a = 1, b = 2, c = 3; function sumLetM(n){ let s = 0; for (let i = 0; i < n; i++) { s = (s + a + b + c) | 0; } return s; } function setLM(){ a = 1; } return [sumLetM, setLM]; }
const fs = [makeVar(), makeLet(), makeVarM()[0], makeLetM()[0]];
for (const f of fs) { %PrepareFunctionForOptimization(f); f(100); f(100); %OptimizeFunctionOnNextCall(f); f(100); }
