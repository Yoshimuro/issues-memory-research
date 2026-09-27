// shift(): left-trim (O(1)) vs memmove (O(n)); pop(): in-place right trim. Uses %DebugPrint elements address/capacity.
const log = (typeof print === 'function') ? print : console.log;
function el(a) { return %HasDictionaryElements(a); }
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
for (const n of [50, 1000, 20000, 100000, 1000000]) {
  const a = []; for (let i = 0; i < n; i++) a.push(i);
  const k = Math.min(2000, n - 1);
  const t0 = now(); for (let i = 0; i < k; i++) a.shift(); const t = now() - t0;
  log('n=' + n + ' shift x' + k + ': ' + (t * 1e6 / k).toFixed(0) + ' ns/shift');
}
