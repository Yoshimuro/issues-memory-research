// Follow-up bytecode variants
function doLoopPlusEq(arr) { let sum = 0; for (let i = 0; i < arr.length; i++) { sum += arr[i] } return sum }
function doLoopPlusLong(arr) { let sum = 0; for (let i = 0; i < arr.length; i++) { sum = sum + arr[i] } return sum }
function doPlusEqParam(sum, x) { sum += x; return sum }
function doPlusLongParam(sum, x) { sum = sum + x; return sum }
var g1, g2;
function doNestGlobal(v) { g1 = g2 = v }
function doSepGlobal(v) { g2 = v; g1 = g2 }
function doNestProp(o, v) { o.a = o.b = v }
function doSepProp(o, v) { o.b = v; o.a = o.b }
function doNestLocal2(v) { let a, b; a = b = v + 1; return [a, b] }
function doSepLocal2(v) { let a, b; b = v + 1; a = b; return [a, b] }
function doTmpLet(a, b) { let r = a + b; return r }
function doIfRet(c) { if (c) return 1; return 2 }
function doTernRet(c) { return c ? 1 : 2 }
function doIfCall(c, f) { if (c) f() }
function doAndCall(c, f) { c && f() }
function doIfCall2(c, f) { if (c) { f(); f() } }
function doAndCall2(c, f) { c && (f(), f()) }
function doDeclRef(c) { function inner() { return 1 } if (c) return inner(); return 0 }
function doDeclUnref() { function inner() { return 1 } return 0 }
function doExprRef(c) { if (c) { var e = function () { return 1 }; return e() } return 0 }
function doSubSmiX(x) { return x - 1 }
function doMulSmi(x) { return x * 3 }
function doBig(x) { return x + 1073741824 }
function doBigInt32(x) { return x + 2147483647 }
for (const f of [doLoopPlusEq, doLoopPlusLong]) f([1, 2]);
for (const f of [doPlusEqParam, doPlusLongParam, doNestGlobal, doSepGlobal, doNestLocal2, doSepLocal2, doTmpLet, doIfRet, doTernRet, doDeclRef, doDeclUnref, doExprRef, doSubSmiX, doMulSmi, doBig, doBigInt32]) f(1, 2);
doNestProp({}, 1); doSepProp({}, 1);
for (const f of [doIfCall, doAndCall, doIfCall2, doAndCall2]) f(true, function () {});
