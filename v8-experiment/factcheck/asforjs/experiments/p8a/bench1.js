// Misc micro-benchmarks for 8.3-8.5. Ratios inside one process, 3 reps.
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
function time(f, arg) { f(arg); f(arg); const t = now(); f(arg); f(arg); f(arg); return (now() - t) / 3; }
const N = 3e6;
const arr = Array.from({ length: 1e6 }, (_, i) => i & 1023);
// named vs element
function named(n) { const o = { name: 1, x: 2 }; let s = 0; for (let i = 0; i < n; i++) s += o.name; return s; }
function element(n) { const a = [1, 2]; let s = 0; for (let i = 0; i < n; i++) s += a[0]; return s; }
// literal vs class
class P { constructor(x, y) { this.x = x; this.y = y; } }
function mkLit(n) { let s = 0; for (let i = 0; i < n; i++) { const o = { x: i, y: 1 }; s += o.x; } return s; }
function mkCls(n) { let s = 0; for (let i = 0; i < n; i++) { const o = new P(i, 1); s += o.x; } return s; }
// deep copy vs construct
const proto = { x: 1, y: 2, z: { a: 1, b: [1, 2, 3] } };
function copyJSON(n) { let s = 0; for (let i = 0; i < n / 30; i++) s += JSON.parse(JSON.stringify(proto)).x; return s; }
function copyStructured(n) { let s = 0; for (let i = 0; i < n / 30; i++) s += structuredClone(proto).x; return s; }
function construct(n) { let s = 0; for (let i = 0; i < n / 30; i++) { const o = { x: 1, y: 2, z: { a: 1, b: [1, 2, 3] } }; s += o.x; } return s; }
// reduce callbacks
const add = (a, b) => a + b;
function addFn(a, b) { return a + b; }
function redInline(a) { return a.reduce((acc, x) => acc + x, 0); }
function redExtArrow(a) { return a.reduce(add, 0); }
function redExtFn(a) { return a.reduce(addFn, 0); }
function forSum(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function chain(a) { return a.filter(x => x & 1).map(x => x * 2).reduce((s, x) => s + x, 0); }
function oneReduce(a) { return a.reduce((s, x) => (x & 1) ? s + x * 2 : s, 0); }
function forChain(a) { let s = 0; for (let i = 0; i < a.length; i++) { const x = a[i]; if (x & 1) s += x * 2; } return s; }
// thisArg vs closure
function fePlainArrow(a) { const st = { s: 0 }; a.forEach(x => { st.s += x; }); return st.s; }
function feThisArg(a) { const st = { s: 0 }; a.forEach(function (x) { this.s += x; }, st); return st.s; }
// concat vs nested push
const parts = Array.from({ length: 100 }, (_, i) => Array.from({ length: 100 }, (_, j) => i + j));
function viaConcat(n) { let s = 0; for (let k = 0; k < n / 3000; k++) s += [].concat(...parts).length; return s; }
function viaPush(n) { let s = 0; for (let k = 0; k < n / 3000; k++) { const r = []; for (let i = 0; i < parts.length; i++) { const p = parts[i]; for (let j = 0; j < p.length; j++) r.push(p[j]); } s += r.length; } return s; }
// instanceof vs property check
class A1 { constructor() { this.kind = 1; } } class B1 extends A1 {} class C1 extends B1 {}
const objs = [new C1(), new A1(), new B1()];
function viaInstanceof(n) { let s = 0; for (let i = 0; i < n; i++) if (objs[i % 3] instanceof A1) s++; return s; }
function viaProp(n) { let s = 0; for (let i = 0; i < n; i++) if (objs[i % 3].kind === 1) s++; return s; }
// arguments vs params
function sumArgs() { return arguments[0] + arguments[1]; }
function sumParams(a, b) { return a + b; }
function sumRest(...r) { return r[0] + r[1]; }
function callArgs(n) { let s = 0; for (let i = 0; i < n; i++) s += sumArgs(i, 1); return s; }
function callParams(n) { let s = 0; for (let i = 0; i < n; i++) s += sumParams(i, 1); return s; }
function callRest(n) { let s = 0; for (let i = 0; i < n; i++) s += sumRest(i, 1); return s; }
const groups = [
  ['named', () => time(named, N)], ['element', () => time(element, N)],
  ['literal', () => time(mkLit, N)], ['class', () => time(mkCls, N)],
  ['JSONcopy', () => time(copyJSON, N)], ['structuredClone', () => typeof structuredClone === 'function' ? time(copyStructured, N) : NaN], ['constructLiteral', () => time(construct, N)],
  ['reduceInline', () => time(redInline, arr)], ['reduceExtArrow', () => time(redExtArrow, arr)], ['reduceExtFn', () => time(redExtFn, arr)], ['forSum', () => time(forSum, arr)],
  ['filterMapReduce', () => time(chain, arr)], ['oneReduce', () => time(oneReduce, arr)], ['forChain', () => time(forChain, arr)],
  ['forEachArrowClosure', () => time(fePlainArrow, arr)], ['forEachThisArg', () => time(feThisArg, arr)],
  ['concat', () => time(viaConcat, N)], ['nestedPush', () => time(viaPush, N)],
  ['instanceof', () => time(viaInstanceof, N)], ['propCheck', () => time(viaProp, N)],
  ['arguments', () => time(callArgs, N)], ['params', () => time(callParams, N)], ['rest', () => time(callRest, N)],
];
for (let rep = 0; rep < 3; rep++) log(`rep${rep} ` + groups.map(([n, f]) => `${n}=${f().toFixed(2)}`).join(' '));
