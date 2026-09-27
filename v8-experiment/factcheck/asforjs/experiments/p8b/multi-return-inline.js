// are functions with several return statements / rest / default params / arguments inlined?
const print = globalThis.print || console.log;
function multiRet(x) { if (x < 10) return 1; if (x < 100) return 2; if (x < 1000) return 3; return 4; }
function withRest(...xs) { return xs.length + xs[0]; }
function withDefault(a, b = 2) { return a + b; }
function withArguments() { return arguments.length + arguments[0]; }
function caller(n) { let s = 0; for (let i = 0; i < n; i++) s += multiRet(i & 2047) + withRest(i, 1) + withDefault(i) + withArguments(i, 2); return s; }
for (let k = 0; k < 200; k++) caller(5000);
print(caller(10));
