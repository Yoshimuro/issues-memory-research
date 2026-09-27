// [a,b]=arr vs {0:a,1:b}=arr vs arr[0],arr[1]; one monomorphic runner per variant; run under different tier flags
function destrArr(arr) { const [a, b] = arr; return a + b; }
function destrObj(arr) { const { 0: a, 1: b } = arr; return a + b; }
function destrIdx(arr) { const a = arr[0], b = arr[1]; return a + b; }
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const data = []; for (let i = 0; i < 1000; i++) data.push([i, i + 1, i + 2]);
const R = +(globalThis.process ? process.argv[2] : (globalThis.arguments && arguments[0])) || 2000;
function runArr() { let s = 0; for (let r = 0; r < R; r++) for (let i = 0; i < 1000; i++) s += destrArr(data[i]); return s; }
function runObj() { let s = 0; for (let r = 0; r < R; r++) for (let i = 0; i < 1000; i++) s += destrObj(data[i]); return s; }
function runIdx() { let s = 0; for (let r = 0; r < R; r++) for (let i = 0; i < 1000; i++) s += destrIdx(data[i]); return s; }
runArr(); runObj(); runIdx();
for (let round = 0; round < 4; round++) {
  let t = now(); runArr(); const a = now() - t;
  t = now(); runObj(); const o = now() - t;
  t = now(); runIdx(); const x = now() - t;
  log(`round ${round} arr=${a.toFixed(0)} obj=${o.toFixed(0)} idx=${x.toFixed(0)} arr/idx=${(a / x).toFixed(2)} obj/idx=${(o / x).toFixed(2)}`);
}
