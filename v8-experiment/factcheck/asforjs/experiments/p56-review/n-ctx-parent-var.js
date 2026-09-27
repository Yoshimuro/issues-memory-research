// top-level has only var/function declarations
function mk() { var arr = [1,2,3]; var small = 7; return function f() { return small; }; }
var f = mk();
console.log('=== mk (top-level fn) in script WITHOUT let/const'); %DebugPrint(mk);
