// Which callee shapes TurboFan inlines (natural tier-up, no %Optimize*).
// Checked via --trace-turbo-inlining: "Inlining <SFI name> into <caller>".
'use strict';
const log = typeof console !== 'undefined' ? console.log : print;

function multiRet(x) {            // several return statements
  if (x < 10) return 1;
  if (x < 100) return 2;
  if (x < 1000) return 3;
  return 4;
}
function switchRet(x) {           // return in every case
  switch (x & 3) { case 0: return 10; case 1: return 20; case 2: return 30; default: return 40; }
}
let sideCounter = 0;
const obj = { total: 0 };
function sideEffect(x) {          // writes outer state (side effect)
  sideCounter++; obj.total += x; return x;
}
function usesArgs() {             // strict-mode `arguments`
  let s = 0; for (let i = 0; i < arguments.length; i++) s += arguments[i]; return s;
}

function usesRest(...xs) {        // rest parameters
  let s = 0; for (let i = 0; i < xs.length; i++) s += xs[i]; return s;
}

function caller_multiRet(n) { let s = 0; for (let i = 0; i < n; i++) s += multiRet(i); return s; }
function caller_switchRet(n) { let s = 0; for (let i = 0; i < n; i++) s += switchRet(i); return s; }
function caller_sideEffect(n) { let s = 0; for (let i = 0; i < n; i++) s += sideEffect(i); return s; }
function caller_usesArgs(n) { let s = 0; for (let i = 0; i < n; i++) s += usesArgs(i, 1, 2); return s; }
function caller_usesRest(n) { let s = 0; for (let i = 0; i < n; i++) s += usesRest(i, 1, 2); return s; }

const named = (a, x) => a + x;
function caller_reduceLiteral(arr) { return arr.reduce((a, x) => a + x, 0); }
function caller_reduceNamed(arr) { return arr.reduce(named, 0); }

const arr = Array.from({ length: 100 }, (_, i) => i);
for (let k = 0; k < 3000; k++) {
  caller_multiRet(100); caller_switchRet(100); caller_sideEffect(100);
  caller_usesArgs(100); caller_usesRest(100);
  caller_reduceLiteral(arr); caller_reduceNamed(arr);
}
const st = (f) => { const s = %GetOptimizationStatus(f); return (s & 64) ? 'TF' : (s & 32) ? 'MAGLEV' : (s & 16) ? 'OPT?' : 'not-opt'; };
for (const f of [caller_multiRet, caller_switchRet, caller_sideEffect, caller_usesArgs, caller_usesRest, caller_reduceLiteral, caller_reduceNamed, usesArgs, usesRest])
  log(`${f.name}: status bits=${%GetOptimizationStatus(f).toString(2)}`);
