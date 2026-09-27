// Where does time go when filling a big array with push? node --trace-gc push-cost.js
function viaPush(n) { const a = []; for (let i = 0; i < n; i++) a.push(i); return a; }
function viaPrealloc(n) { const a = new Array(n).fill(0); for (let i = 0; i < n; i++) a[i] = i; return a; }
function viaPushDouble(n) { const a = []; for (let i = 0; i < n; i++) a.push(i + 0.5); return a; }
const N = 1e7;
for (let r = 0; r < 3; r++) {
  for (const f of [viaPush, viaPrealloc, viaPushDouble]) {
    const t = process.hrtime.bigint(); const a = f(N); const ms = Number(process.hrtime.bigint() - t) / 1e6;
    console.log(`round ${r} ${f.name.padEnd(14)} ${ms.toFixed(0)} ms  len=${a.length}`);
  }
}
