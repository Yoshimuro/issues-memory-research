// Summary item 18: "rest/arguments/динамическое число аргументов отключают инлайнинг". Arity mismatch and 4+ args.
function f3(a, b, c){ return (a | 0) + (b | 0) + (c | 0); }
function f5(a, b, c, d, e){ return a + b + c + d + e; }
function fewer(x){ return f3(x, 1); }             // under-application
function more(x){ return f3(x, 1, 2, 3, 4); }     // over-application
function five(x){ return f5(x, 1, 2, 3, 4); }     // 5 args (no Call*N specialization in bytecode)
function spreadDyn(arr){ return f3(...arr); }      // spread of a non-constant array
for (const f of [fewer, more, five, spreadDyn, f3, f5]) %PrepareFunctionForOptimization(f);
for (let i = 0; i < 100; i++) { fewer(i); more(i); five(i); spreadDyn([i, 1, 2]); }
for (const f of [fewer, more, five, spreadDyn]) { %OptimizeFunctionOnNextCall(f); }
fewer(1); more(1); five(1); spreadDyn([1, 2, 3]);
