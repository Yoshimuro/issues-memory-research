// Doc l.530: "a hash collision of two different Symbols would be a V8 bug".
// Create N symbols, print each one's hash via %DebugPrint (node prints full form), put all into one Map,
// and verify the Map keeps them apart. Colliding hashes are found afterwards from the printed output.
const N = +process.argv[2] || 150000;
const syms = [];
for (let i = 0; i < N; i++) { const s = Symbol('s' + i); syms.push(s); %DebugPrint(s); }
const m = new Map();
for (let i = 0; i < N; i++) m.set(syms[i], i);
let ok = m.size === N;
for (let i = 0; i < N; i++) if (m.get(syms[i]) !== i) ok = false;
process.stderr.write('MAP size=' + m.size + ' all lookups correct=' + ok + '\n');
