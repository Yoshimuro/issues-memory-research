// Identifier names vs literals; literal survival after rebinding. d8-debug --allow-natives-syntax --expose-gc intern1.js
var abc = 1;
var nameFromGlobal = Object.keys(globalThis).find(function (k) { return k === 'ab' + 'c'.repeat(1); });
print('#### identifier name abc (from global object keys)'); %DebugPrint(nameFromGlobal);
print("#### literal 'abc'"); %DebugPrint('abc');
print("#### literal 'ABC' (different case)"); %DebugPrint('ABC');
function f() { var abc = 2; return function () { return abc; }; }
print("#### 'abc' literal inside function"); (function () { %DebugPrint('abc'); })();
var s = 'hello'; print("#### 'hello' first"); %DebugPrint(s);
s = null; gc(); gc();
print("#### 'hello' again after s=null + 2 GCs"); %DebugPrint('hel' + 'lo');
print("#### computed 'hel'+x"); var x = 'lo'; %DebugPrint('hel' + x);
