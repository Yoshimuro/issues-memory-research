// natural tier-up with --trace-opt
function* gen(n) { for (let i = 0; i < n; i++) yield i; }
async function af(x) { const y = await x; return y + 1; }
function sumGen() { let s = 0; for (const v of gen(100)) s += v; return s; }
let t = 0; for (let k = 0; k < 20000; k++) t += sumGen();
(async () => { let u = 0; for (let k = 0; k < 200000; k++) u += await af(k); console.log('done', t, u); })();
