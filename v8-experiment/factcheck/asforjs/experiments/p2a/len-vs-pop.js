// this.data.length -= 2 vs two pop(): interpreter (--jitless) and default tiers
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const log = typeof print === 'function' ? print : console.log;
function Store() { this.data = [] }
Store.prototype.doLen = function () { this.data.push(1, 2); this.data.length -= 2 };
Store.prototype.doPop = function () { this.data.push(1, 2); this.data.pop(); this.data.pop() };
const N = 3e6; const res = { doLen: [], doPop: [] };
for (let r = 0; r < 5; r++) for (const k of ['doLen', 'doPop']) { const s = new Store(); s.data.push(0); const t = now(); for (let i = 0; i < N; i++) s[k](); res[k].push(now() - t); }
const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
for (const k of Object.keys(res)) log(`${k}: [${res[k].map(x => x.toFixed(0)).join(' ')}] median ${med(res[k]).toFixed(0)} ms`);
log(`doLen/doPop = ${(med(res.doLen) / med(res.doPop)).toFixed(2)}`);
