// OSR bug workaround: move the loop body into a separate small function.
// main() is called once; its loop is hot -> OSR. Callback comes from a non-global scope.
const log = typeof console !== 'undefined' ? console.log : print;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const arr = Array.from({ length: 16 }, (_, i) => i);
const gconst = (a, x) => a + x;
function inlineBody(n) { let s = 0; for (let i = 0; i < n; i++) s += arr.reduce(gconst, 0); return s; }
function step() { return arr.reduce(gconst, 0); }
function separateBody(n) { let s = 0; for (let i = 0; i < n; i++) s += step(); return s; }
for (const f of [inlineBody, separateBody]) { const t = now(); const r = f(3e6); log(`${f.name}: ${(now() - t).toFixed(0)} ms (r=${r})`); }
