// Which callees get inlined by TurboFan (use --trace-turbo-inlining)
function multiRet(x) { if (x > 5) return 1; if (x < 2) return -1; return 0; }
function callMultiRet(n) { let s = 0; for (let i = 0; i < n; i++) s += multiRet(i & 7); return s; }
function three(a, b, c) { return a + b + (c === undefined ? 0 : c); }
function callMismatch(n) { let s = 0; for (let i = 0; i < n; i++) s += three(i, 1) + three(i, 1, 2, 3); return s; }
function useArgs() { return arguments[0] + arguments[1]; }
function callArgs(n) { let s = 0; for (let i = 0; i < n; i++) s += useArgs(i, 1); return s; }
function useRest(...r) { return r[0] + r[1]; }
function callRest(n) { let s = 0; for (let i = 0; i < n; i++) s += useRest(i, 1); return s; }
function switchRet(x) { switch (x) { case 1: return 10; case 2: return 20; default: return 0; } }
function callSwitch(n) { let s = 0; for (let i = 0; i < n; i++) s += switchRet(i & 3); return s; }
for (const [f] of [[callMultiRet], [callMismatch], [callArgs], [callRest], [callSwitch]]) {
  %PrepareFunctionForOptimization(f); f(1000); f(1000); %OptimizeFunctionOnNextCall(f); f(10);
}
