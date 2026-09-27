// First call of a large, never-called function includes its parse+bytecode compile.
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const log = typeof print === 'function' ? print : console.log;
for (let rep = 0; rep < 3; rep++) {
  let body = '';
  for (let i = 0; i < 20000; i++) body += `if (p === ${i + rep * 1e6}) { s += ${i}; }\n`;
  const src = `(function(){ return function doBig${rep}(p){ var s = 0;\n${body} return s; } })()`;
  const f = (0, eval)(src);             // outer IIFE compiled; doBig only preparsed
  const t0 = now(); f(1); const t1 = now(); f(2); const t2 = now(); f(3); const t3 = now();
  log(`rep ${rep}: 1st call ${(t1 - t0).toFixed(2)} ms, 2nd ${(t2 - t1).toFixed(2)} ms, 3rd ${(t3 - t2).toFixed(2)} ms, ratio 1st/2nd ${((t1 - t0) / (t2 - t1)).toFixed(1)}x`);
}
