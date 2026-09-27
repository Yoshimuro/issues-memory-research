// p9-17/p9-18: which bytecodes touch context slots for top-level let (script context) and for
// captured let inside a function; are there distinct "tracked" variants?
let top = 1;
function bump() { top = top + 1; return top; }
function outer() { let a = 1; let b = 2; const c = 3; b = b + 1; return function inner() { return a + b + c; }; }
bump(); outer()();
