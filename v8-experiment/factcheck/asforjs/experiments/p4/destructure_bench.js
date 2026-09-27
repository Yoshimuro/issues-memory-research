// const [a,b] = arr  vs  const {0:a,1:b} = arr  vs  indices; same process, alternating, 5 rounds
function destrArr(arr) { const [a, b] = arr; return a + b; }
function destrObj(arr) { const { 0: a, 1: b } = arr; return a + b; }
function destrIdx(arr) { const a = arr[0], b = arr[1]; return a + b; }
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const data = []; for (let i = 0; i < 1000; i++) data.push([i, i + 1, i + 2]);
function run(f) { let s = 0; for (let r = 0; r < 20000; r++) for (let i = 0; i < 1000; i++) s += f(data[i]); return s; }
const fs = { destrArr, destrObj, destrIdx };
for (const k in fs) run(fs[k]); // warmup
for (let round = 0; round < 5; round++) {
  const res = {};
  for (const k in fs) { const t0 = now(); run(fs[k]); res[k] = now() - t0; }
  log('round ' + round + ' ' + Object.entries(res).map(([k, v]) => k + '=' + v.toFixed(0) + 'ms').join(' ') + ' arr/idx=' + (res.destrArr / res.destrIdx).toFixed(2));
}
