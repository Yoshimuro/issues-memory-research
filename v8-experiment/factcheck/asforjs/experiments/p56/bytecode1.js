// --print-bytecode --print-bytecode-filter=<name>
function isStr(x) { return typeof x === 'string'; }
function eqLit(x) { return x === 'ABC'; }
function tpl(a, b) { return `${a}-${b}`; }
function plus(a, b) { return a + '-' + b; }
function lits() { return 'A' + 'BC'; }
function regs(a) { var x = a + 1, y = x * 2, z = y - 3; return x + y + z; }
function outer(n) { var arr = new Array(1000).fill(n); var small = 1; return function inner() { return small; }; }
function zf(b) { var z = 0; var f = false; return b ? z : f; }
isStr(1); eqLit(1); tpl(1,2); plus(1,2); lits(); regs(1); outer(1)(); zf(1);
