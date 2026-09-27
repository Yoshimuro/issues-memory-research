// Reproduction of "Array Allocation" setup: push 18/pop 5/push 16/pop 8/push 20/pop 11 per iteration.
// realloc: arr.length = 0 each iteration (backing store dropped -> regrow every time).
// control: array prefilled with 140 elements, arr.length = 70 each iteration (all within capacity 140).
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const args = (typeof process !== 'undefined') ? process.argv.slice(2) : arguments;
const mode = args[0] || 'wild';
function doArrayPush(arr, n) { for (let i = 0; i < n; i++) arr.push(i); }
function doArrayPop(arr, n) { for (let i = 0; i < n; i++) arr.pop(); }
function body(arr, base) { arr.length = base; doArrayPush(arr, 18); doArrayPop(arr, 5); doArrayPush(arr, 16); doArrayPop(arr, 8); doArrayPush(arr, 20); doArrayPop(arr, 11); }
function runRealloc(n) { const arr = []; for (let k = 0; k < n; k++) body(arr, 0); return arr.length; }
function runControl(n) { const arr = []; for (let i = 0; i < 140; i++) arr.push(i); for (let k = 0; k < n; k++) body(arr, 70); return arr.length; }
if (mode === 'ignition') { %NeverOptimizeFunction(doArrayPush); %NeverOptimizeFunction(doArrayPop); %NeverOptimizeFunction(body); %NeverOptimizeFunction(runRealloc); %NeverOptimizeFunction(runControl); }
const N = mode === 'ignition' ? 100000 : 1000000;
for (let round = 0; round < 4; round++) {
  let t0 = now(); runRealloc(N); const tr = now() - t0; t0 = now(); runControl(N); const tc = now() - t0;
  log(mode + ' round ' + round + ' realloc=' + tr.toFixed(0) + 'ms control=' + tc.toFixed(0) + 'ms ratio=' + (tr / tc).toFixed(2));
}
