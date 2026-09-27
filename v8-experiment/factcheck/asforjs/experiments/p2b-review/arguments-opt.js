// Doc line 348: arguments is "единственный уцелевший пункт старых списков break JavaScript optimization".
// Old killer list (petkaantonov wiki): leaking arguments, reassigning a param while using arguments, arguments.length loops, apply(arguments).
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
function sloppyMappedWrite(a, b){ a = 5; return arguments[0] + b; }                 // mapped (exotic) arguments + param reassignment
function leak(){ return arguments; }                                                // leaking arguments
function leakUser(){ const a = leak(1, 2, 3); return a[0] + a.length; }
function lenLoop(){ let s = 0; for (let i = 0; i < arguments.length; i++) s += arguments[i]; return s; }
function applyArgs(){ return Math.max.apply(Math, arguments); }
function strictArgs(){ 'use strict'; return arguments[0] + arguments.length; }
function withEval(x){ return eval('x + 1'); }
function withTry(x){ try { return x + 1; } catch (e) { return 0; } }
const fs = { sloppyMappedWrite, leakUser, lenLoop, applyArgs, strictArgs, withEval, withTry };
for (const k in fs) %PrepareFunctionForOptimization(fs[k]);
for (let i = 0; i < 200; i++) for (const k in fs) fs[k](i, 2, 3);
for (const k in fs) { %OptimizeFunctionOnNextCall(fs[k]); fs[k](1, 2, 3); }
for (let i = 0; i < 200; i++) for (const k in fs) fs[k](i, 2, 3);
// 11.3..13.6 layout: bit4 kOptimized, bit6 kTurboFanned; 15.6 layout differs (kTurboFanned=1<<5? printed raw)
for (const k in fs) { const st = %GetOptimizationStatus(fs[k]); print(k.padEnd(18), 'status', st.toString(2)); }
