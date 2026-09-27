// Line 160: guards in TurboFan code: Smi check, jo after add, map check before property load; line 117: x/2, x%2, const
function add(a, b) { return a + b; }
function getAge(o) { return o.age; }
function half(x) { return x / 2; }
function halfInt(x) { return (x / 2) | 0; }
function mod2(x) { return x % 2; }
function withConst(x) { const k = 7; return x + k; }
const o = { name: 'a', age: 3 };
for (const [f, args] of [[add, [1, 2]], [getAge, [o]], [half, [8]], [halfInt, [9]], [mod2, [7]], [withConst, [5]]]) {
  %PrepareFunctionForOptimization(f);
  for (let i = 0; i < 50; i++) f(...args);
  %OptimizeFunctionOnNextCall(f); f(...args);
}
