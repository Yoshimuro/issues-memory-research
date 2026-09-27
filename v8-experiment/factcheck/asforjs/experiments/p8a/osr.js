// OSR + inlining of a helper referenced from various scopes. Run: node osr.js <variant>
const v = process.argv[2]; const N = 1e8;
function helperTop(x) { return (x * 3 + 1) & 1023; }
let t = Date.now(), s = 0;
if (v === 'A') { // loop at module top level (CJS wrapper function), helper from module scope
  for (let i = 0; i < N; i++) s += helperTop(i);
} else if (v === 'B') { // loop inside a function, helper is local const closure (register)
  (function () { const h = (x) => (x * 3 + 1) & 1023; for (let i = 0; i < N; i++) s += h(i); })();
} else if (v === 'C') { // loop inside inner function, helper lives in outer function's context
  (function outer() { const h = (x) => (x * 3 + 1) & 1023; function inner() { let r = 0; for (let i = 0; i < N; i++) r += h(i); return r; } s = inner(); })();
} else if (v === 'D') { // body inline, no call
  (function () { for (let i = 0; i < N; i++) s += (i * 3 + 1) & 1023; })();
} else if (v === 'E') { // loop body extracted to a function called per chunk (no OSR needed)
  function chunk(from, to) { let r = 0; for (let i = from; i < to; i++) r += helperTop(i); return r; }
  for (let c = 0; c < N; c += 1e5) s += chunk(c, c + 1e5);
}
console.log(`${v}: ${Date.now() - t} ms s=${s}`);
