// find the largest array that can be spread into call args, and compare with Function.prototype.apply
const print = globalThis.print || console.log;
function f() { return arguments.length; }
function probe(kind) {
  let lo = 1, hi = 1 << 24;
  while (lo < hi) { const mid = (lo + hi + 1) >> 1; const a = new Array(mid).fill(1);
    let ok = true; try { kind === 'spread' ? f(...a) : kind === 'apply' ? f.apply(null, a) : Math.max(...a); } catch (e) { ok = false; if (!(e instanceof RangeError)) throw e; }
    if (ok) lo = mid; else hi = mid - 1; }
  return lo;
}
for (const k of ['spread', 'apply', 'Math.max']) print(k + ' max args: ' + probe(k));
try { f(...new Array(1e6).fill(1)); } catch (e) { print('1e6 spread: ' + e.constructor.name + ': ' + e.message); }
