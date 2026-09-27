// Variant: shrink a prefilled array by 2 per step (no push in the timed op), via length -= 2 vs two pop()
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const log = typeof print === 'function' ? print : console.log;
function Store(n) { this.data = new Array(n).fill(1) }
function doLen(s) { while (s.data.length > 0) s.data.length -= 2 }
function doPop(s) { while (s.data.length > 0) { s.data.pop(); s.data.pop() } }
const N = 2e6, R = 7; const res = { doLen: [], doPop: [] };
for (let r = 0; r < R; r++) for (const [k, f] of [['doLen', doLen], ['doPop', doPop]]) { const s = new Store(N); const t = now(); f(s); res[k].push(now() - t); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k of Object.keys(res)) log(`${k}: [${res[k].map(x => x.toFixed(1)).join(' ')}] median ${med(res[k]).toFixed(1)} ms`);
log(`doLen/doPop = ${(med(res.doLen) / med(res.doPop)).toFixed(2)}`);
// semantics on too-short array
try { const a = [1]; a.length -= 2; log('len on [1] ok', a.length) } catch (e) { log('len on [1]:', e.constructor.name, e.message) }
{ const a = [1]; a.pop(); a.pop(); log('pop on [1] ok, length', a.length) }
