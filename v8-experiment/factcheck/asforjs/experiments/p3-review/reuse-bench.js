// Doc l.526: "reusing objects instead of intermediate ones gives an order-of-magnitude speedup"
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const N = 2e7;
// 1) temp object that does not escape (escape analysis can remove it)
function tempLocal(n){ let s = 0; for (let i = 0; i < n; i++) { const p = {x: i, y: i + 1}; s += p.x + p.y; } return s; }
const R = {x: 0, y: 0};
function reuseLocal(n){ let s = 0; for (let i = 0; i < n; i++) { R.x = i; R.y = i + 1; s += R.x + R.y; } return s; }
// 2) temp object returned from a non-inlined helper and kept briefly (escapes -> real allocation)
function mk(i){ return {x: i, y: i + 1}; }
%NeverOptimizeFunction(mk);
function tempEscape(n){ let s = 0; const ring = new Array(64); for (let i = 0; i < n; i++) { const p = mk(i); ring[i & 63] = p; s += p.x + p.y; } return s; }
const pool = []; for (let i = 0; i < 64; i++) pool.push({x: 0, y: 0});
function fill(o, i){ o.x = i; o.y = i + 1; return o; }
%NeverOptimizeFunction(fill);
function reuseEscape(n){ let s = 0; for (let i = 0; i < n; i++) { const p = fill(pool[i & 63], i); s += p.x + p.y; } return s; }
// 3) same as 2 but helpers are allowed to inline (normal code)
function mk2(i){ return {x: i, y: i + 1}; }
function tempRing(n){ let s = 0; const ring = new Array(64); for (let i = 0; i < n; i++) { const p = mk2(i); ring[i & 63] = p; s += p.x + p.y; } return s; }
function fill2(o, i){ o.x = i; o.y = i + 1; return o; }
function reuseRing(n){ let s = 0; for (let i = 0; i < n; i++) { const p = fill2(pool[i & 63], i); s += p.x + p.y; } return s; }
function t(f, n){ f(1e5); const a = now(); f(n); return now() - a; }
for (let rep = 0; rep < 3; rep++) {
  const a = t(tempLocal, N), b = t(reuseLocal, N);
  const c = t(tempEscape, N/4), d = t(reuseEscape, N/4);
  const e = t(tempRing, N), f = t(reuseRing, N);
  log(`rep${rep} nonEscaping temp/reuse ${a.toFixed(0)}/${b.toFixed(0)} ms = ${(a/b).toFixed(2)}x | noInline temp/reuse ${c.toFixed(0)}/${d.toFixed(0)} = ${(c/d).toFixed(2)}x | ring(inlined) temp/reuse ${e.toFixed(0)}/${f.toFixed(0)} = ${(e/f).toFixed(2)}x`);
}
