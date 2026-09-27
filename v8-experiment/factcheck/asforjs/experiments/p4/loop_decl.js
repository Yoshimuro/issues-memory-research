// for (var i = 0; ...) vs `var i;` declared above and only assigned in the for header (same process, 5 rounds)
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const arr = []; for (let i = 0; i < 1e6; i++) arr.push(i & 1023);
function inHeader(a) { let s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
function declaredAbove(a) { var i; let s = 0; for (i = 0; i < a.length; i++) s += a[i]; return s; }
function letHeader(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
for (let r = 0; r < 10; r++) { inHeader(arr); declaredAbove(arr); letHeader(arr); }
for (let round = 0; round < 5; round++) {
  const t = {};
  for (const [k, f] of [['inHeader', inHeader], ['declaredAbove', declaredAbove], ['letHeader', letHeader]]) { const t0 = now(); for (let r = 0; r < 50; r++) f(arr); t[k] = now() - t0; }
  log('round ' + round + ' ' + Object.entries(t).map(([k, v]) => k + '=' + v.toFixed(1)).join(' ') + ' above/header=' + (t.declaredAbove / t.inHeader).toFixed(2));
}
