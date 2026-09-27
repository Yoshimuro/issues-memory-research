// Reading a missing property (deep proto chain) vs an existing own property; also long proto chain lookups
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
let p = {}; for (let i = 0; i < 10; i++) p = Object.create(p); // chain depth ~11
const o = Object.create(p); o.present = 1;
const deep = Object.create(p); Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(p))).inherited = 1; // property 3 levels above p
function readPresent(n) { let s = 0; for (let i = 0; i < n; i++) s += o.present; return s; }
function readMissing(n) { let s = 0; for (let i = 0; i < n; i++) s += (o.missing === undefined) ? 1 : 0; return s; }
function readInherited(n) { let s = 0; for (let i = 0; i < n; i++) s += deep.inherited; return s; }
function t(f) { f(1e4); f(1e4); const a = now(); f(3e7); return (now() - a).toFixed(1); }
for (let r = 0; r < 3; r++) log(`rep${r}: present ${t(readPresent)} | missing(depth 11) ${t(readMissing)} | inherited(depth ~8) ${t(readInherited)}`);
