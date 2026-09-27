// Bytecode shapes for claims in digest lines 275-306 and summary 42-43
function doSum(p1) { var p2 = 2; return p2 + p1 }
function doAdd(p1, p2) { return p1 + p2 }
function doRet2() { return 2 }
function doFold72() { return 7 + 2 }
function doFold11() { return 1 + 1 }
function doStmt11() { 1 + 1 }
function doDead(a) { return a; a = a + 1; return a * 2 }
function doConstC(a) { const c = 2; return a + c }
function doAddSmi(a) { return a + 11 }
function doDivSmi(a) { return a / 11 }
function doModSmi(a) { return a % 11 }
function doAndSmi(a) { return a & 11 }
function doShr(a) { return a >> 1 }
function doNegZero() { var sum = -0; return sum }
function doZero() { var sum = 0; return sum }
function doFalse() { var s = false; return s }
function doTrueUndef() { var t = true; var u = undefined; var n = null; return [t, u, n] }
function doStr() { return "hello" }
function doSeven() { return 7 }
function t0() {} function t1(a) {} function t2(a, b) {} function t3(a, b, c) {}
function doCalls(x, y, z) { t0(); t1(x); t2(x, y); t3(x, y, z); }
function doProps(o, x, y, z) { o.m0(); o.m1(x); o.m2(x, y); o.m3(x, y, z); }
function test(...args) { return args }
function doRest(x, y) { return test(x, y) }
function doLog(x) { console.log(x) }
function doKeyName(obj) { return obj["name"] }
function doKey0(obj) { return obj[0] }
function doKeyConst(obj) { const k = "name"; return obj[k] }
function doPlusEq(x) { var sum = 1; sum += x; return sum }
function doPlusLong(x) { var sum = 1; sum = sum + x; return sum }
function doNotLess(a, b) { return !(a < b) }
function doGe(a, b) { return a >= b }
function doNestedAssign(o, v) { o.a = o.b = v }
function doSepAssign(o, v) { o.b = v; o.a = v }
function doNestedLocal(v) { var a, b; a = b = v; return a + b }
function doSepLocal(v) { var a, b; b = v; a = b; return a + b }
function doTmp(a, b) { var r = a + b; return r }
function doNoTmp(a, b) { return a + b }
function doIfStmt(c) { var x; if (c) x = 1; else x = 2; return x }
function doTernary(c) { var x = c ? 1 : 2; return x }
function doIfMulti(c) { var x, y; if (c) { x = 1; y = 2 } else { x = 2; y = 3 } return x + y }
function doLess(a) { return a < 3 }
function doIsArray(list) { var n = 0; for (const x of list) { if (Array.isArray(x)) n++ } return n }
function doIsArrayCached(list) { var isArray = Array.isArray; var n = 0; for (const x of list) { if (isArray(x)) n++ } return n }
function doArrI(arr, i) { return arr[i] + arr[i] + arr[i] }
function doArrIConst(arr, i) { const value = arr[i]; return value + value + value }
function doThisData() { return this.data.a + this.data.b + this.data.c }
function doThisDataLocal() { const d = this.data; return d.a + d.b + d.c }
function doLenMinus() { this.data.length -= 2 }
function doTwoPop() { this.data.pop(); this.data.pop() }
function doUnusedVars() { var x1; var x2; var x3; let y1; let y2; return 1 }
function doBlock() { let a = 1; { let a = 2; a++ } return a }
function doDecls() { function inner1() { return 1 } var e = function () { return 2 }; return 3 }
var all = [doSum, doAdd, doRet2, doFold72, doFold11, doStmt11, doDead, doConstC, doAddSmi, doDivSmi, doModSmi, doAndSmi, doShr, doNegZero, doZero, doFalse, doTrueUndef, doStr, doSeven, doCalls, doProps, doRest, doKeyName, doKey0, doKeyConst, doPlusEq, doPlusLong, doNotLess, doGe, doNestedAssign, doSepAssign, doNestedLocal, doSepLocal, doTmp, doNoTmp, doIfStmt, doTernary, doIfMulti, doLess, doIsArray, doIsArrayCached, doArrI, doArrIConst, doDecls, doUnusedVars, doBlock];
var o = { m0() {}, m1() {}, m2() {}, m3() {} };
var self = { data: [1, 2, 3, 4], f1: doThisData, f2: doThisDataLocal, f3: doLenMinus, f4: doTwoPop };
var cl = typeof console !== 'undefined' ? console : { log() {} };
for (const f of all) { try { f(1, 2, 3); } catch (e) {} }
doProps(o, 1, 2, 3); doLog(1); doKeyName({ name: 1 }); doKey0([1]); doKeyConst({ name: 1 });
doIsArray([[1], 2]); doIsArrayCached([[1], 2]); doArrI([1], 0); doArrIConst([1], 0);
self.data = { a: 1, b: 2, c: 3 }; self.f1(); self.f2(); self.data = [1, 2, 3, 4]; self.f3(); self.f4();
