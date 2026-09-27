// Cost of creating a 2-element container: [a, b] vs new Int32Array(2) vs Int32Array.of(a, b)
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const N = 2e6;
function arr() { let s = 0; for (let i = 0; i < N; i++) { const p = [i, i + 1]; s = (s + p[0] + p[1]) | 0; } return s; }
function ta() { let s = 0; for (let i = 0; i < N; i++) { const p = new Int32Array(2); p[0] = i; p[1] = i + 1; s = (s + p[0] + p[1]) | 0; } return s; }
function taOf() { let s = 0; for (let i = 0; i < N; i++) { const p = Int32Array.of(i, i + 1); s = (s + p[0] + p[1]) | 0; } return s; }
arr(); ta(); taOf();
for (let r = 0; r < 3; r++) {
  let t = now(); arr(); const a = now() - t; t = now(); ta(); const b = now() - t; t = now(); taOf(); const c = now() - t;
  log(`round ${r} array=${a.toFixed(1)} newInt32Array=${b.toFixed(1)} Int32Array.of=${c.toFixed(1)} ta/array=${(b / a).toFixed(1)} of/array=${(c / a).toFixed(1)}`);
}
