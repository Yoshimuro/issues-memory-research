// Recursion depth vs number of locals (interpreter frame = Register count * 8 bytes + fixed part).
var out = (typeof print === 'function') ? print : console.log;
var max = 0;
function r0(n) { max = n; r0(n + 1); }
function r5(n) { var a = n + 1, b = a * 2, c = b - 3, d = c ^ 5, e = d | 1; max = n; r5(n + 1); return a + b + c + d + e; }
function r20(n) { var a1=n,a2=n,a3=n,a4=n,a5=n,a6=n,a7=n,a8=n,a9=n,a10=n,b1=n,b2=n,b3=n,b4=n,b5=n,b6=n,b7=n,b8=n,b9=n,b10=n;
  max = n; r20(n + 1); return a1+a2+a3+a4+a5+a6+a7+a8+a9+a10+b1+b2+b3+b4+b5+b6+b7+b8+b9+b10; }
for (const [name, f] of [['0 locals', r0], ['5 locals', r5], ['20 locals', r20]]) {
  max = 0; try { f(0); } catch (e) {} out(name.padEnd(10) + ' max depth ' + max);
}
