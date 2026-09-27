// Doc l.491: "an array used as a tuple (index 0 number, index 1 string) is expensive"
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const M = 1000;
const tuples = [], objs = [], pairsSmi = [];
for (let i = 0; i < M; i++) { tuples.push([i, 's' + i]); objs.push({n: i, s: 's' + i}); pairsSmi.push([i, i & 7]); }
log('kinds: tuple PACKED_ELEMENTS?', %HasObjectElements(tuples[0]), 'smiPair PACKED_SMI?', %HasSmiElements(pairsSmi[0]));
function sumTuple(a){ let s = 0; for (let i = 0; i < a.length; i++) { const t = a[i]; s += t[0] + t[1].length; } return s; }
function sumObj(a){ let s = 0; for (let i = 0; i < a.length; i++) { const t = a[i]; s += t.n + t.s.length; } return s; }
function sumSmiPair(a){ let s = 0; for (let i = 0; i < a.length; i++) { const t = a[i]; s += t[0] + t[1]; } return s; }
function t(f, a, reps){ for (let k = 0; k < 200; k++) f(a); const st = now(); let x = 0; for (let k = 0; k < reps; k++) x += f(a); return now() - st; }
for (let rep = 0; rep < 3; rep++) {
  const a = t(sumTuple, tuples, 20000), b = t(sumObj, objs, 20000), c = t(sumSmiPair, pairsSmi, 20000);
  log(`rep${rep} tuple ${a.toFixed(0)} ms, object ${b.toFixed(0)} ms, smi-pair ${c.toFixed(0)} ms; tuple/object=${(a/b).toFixed(2)}x`);
}
