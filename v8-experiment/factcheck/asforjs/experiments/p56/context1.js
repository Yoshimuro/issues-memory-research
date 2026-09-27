// Closure context contents. d8-debug --allow-natives-syntax context1.js
function mk1() { var arr = new Array(1000).fill(1); var small = 7; return function f1() { return small; }; }
function mk2() { var arr = new Array(1000).fill(1); var small = 7; return function f2() { return arr[100]; }; }
function mk3() { var arr = new Array(1000).fill(1); var small = 7;
  function unusedHelper() { return arr.length; }   // never returned, never called
  return function f3() { return small; }; }
function mk4() { var arr = new Array(1000).fill(1); var small = 7;
  return function mid() { return function deep() { return small; }; }; }
function mk5(param) { return function f5() { return param; }; }
print('#### f1 (uses only small)'); %DebugPrint(mk1());
print('#### f2 (uses arr[100])'); %DebugPrint(mk2());
print('#### f3 (sibling closure uses arr)'); %DebugPrint(mk3());
print('#### deep (two levels)'); %DebugPrint(mk4()());
print('#### f5 (captured parameter)'); %DebugPrint(mk5({tag: 1}));
