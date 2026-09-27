// loop counter init 0.1 vs 0: HeapNumber allocations (count scavenges)
const mode = process.argv[2];
function loopInt(n) { let s = 0; for (let i = 0; i < n; i++) s += 1; return s; }
function loopFloat(n) { let s = 0; for (let i = 0.1; i < n; i++) s += 1; return s; }
const f = mode === 'float' ? loopFloat : loopInt;
const t = Date.now(); const r = f(3e7);
console.log(`${mode}: ${Date.now()-t} ms r=${r}`);
