// Interpreter-only (--jitless): x>>1 vs x/2 (both one bytecode) vs x>>1 plus one extra bytecode.
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const log = typeof print === 'function' ? print : console.log;
function doShift(n) { let s = 0; for (let i = 0; i < n; i += 2) { s = i >> 1; } return s }
function doDiv(n) { let s = 0; for (let i = 0; i < n; i += 2) { s = i / 2; } return s }
function doShiftExtra(n) { let s = 0; for (let i = 0; i < n; i += 2) { s = (i >> 1) | 0; } return s }
const N = 2e7; const fns = { doShift, doDiv, doShiftExtra }; const res = { doShift: [], doDiv: [], doShiftExtra: [] };
for (let r = 0; r < 5; r++) for (const k of Object.keys(fns)) { const t = now(); fns[k](N); res[k].push(now() - t); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k of Object.keys(res)) log(`${k}: [${res[k].map(x => x.toFixed(0)).join(' ')}] median ${med(res[k]).toFixed(0)} ms, vs doShift ${(med(res[k]) / med(res.doShift)).toFixed(2)}x`);
