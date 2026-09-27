// reduce callback: literal vs identifier from different scopes, inside a hot loop of a function
// that is called ONCE (so it can only be optimized via OSR) or called MANY times (normal tier-up).
// usage: node e08-reduce-callback.js <variant> <once|many>
const log = typeof console !== 'undefined' ? console.log : print;
const argv = typeof process !== 'undefined' ? process.argv.slice(2) : arguments;
const variant = argv[0] || 'literal', how = argv[1] || 'once';
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const arr = Array.from({ length: 16 }, (_, i) => i);
function declSum(a, x) { return a + x; }          // global function declaration
const gconst = (a, x) => a + x;                     // top-level const (script context)
const ITER = 3e6;
const bodies = {
  literal(n) { let s = 0; for (let i = 0; i < n; i++) s += arr.reduce((a, x) => a + x, 0); return s; },
  globalDecl(n) { let s = 0; for (let i = 0; i < n; i++) s += arr.reduce(declSum, 0); return s; },
  globalConst(n) { let s = 0; for (let i = 0; i < n; i++) s += arr.reduce(gconst, 0); return s; },
  localConst(n) { const cb = (a, x) => a + x; let s = 0; for (let i = 0; i < n; i++) s += arr.reduce(cb, 0); return s; },
};
const f = bodies[variant];
let t0 = now(), r;
if (how === 'once') r = f(ITER);
else { r = 0; for (let k = 0; k < ITER / 1000; k++) r += f(1000); }
log(`${variant} ${how}: ${(now() - t0).toFixed(0)} ms (r=${r})`);
