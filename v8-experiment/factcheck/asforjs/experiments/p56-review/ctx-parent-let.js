// top-level has a const declaration
const K = 1;
function mk() { var arr = [1,2,3]; var small = 7; return function f() { return small; }; }
const f = mk();
print('=== mk (top-level fn) in script WITH let/const'); %DebugPrint(mk);
