const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
// when does an object with dynamically added keys go to dictionary mode?
const o = {}; let first = -1;
for (let i = 0; i < 2000; i++) { o['k' + i] = i; if (first < 0 && !%HasFastProperties(o)) first = i + 1; }
log(`keyed adds: dictionary mode after ${first} properties`);
const o2 = {}; let first2 = -1;
for (let i = 0; i < 2000; i++) { Object.defineProperty(o2, 'k' + i, {value: i, writable: true, enumerable: true, configurable: true}); if (first2 < 0 && !%HasFastProperties(o2)) { first2 = i + 1; } }
log(`defineProperty adds: dictionary mode after ${first2} properties`);
const o3 = {a:1,b:2,c:3}; delete o3.a; log(`delete non-last property -> fast: ${%HasFastProperties(o3)}`);
const o4 = {a:1,b:2,c:3}; delete o4.c; log(`delete last-added property -> fast: ${%HasFastProperties(o4)}`);
// dictionary object vs Map, random-ish access with 10000 string keys
const K = 10000; const keys = Array.from({ length: K }, (_, i) => 'key' + i);
const dObj = {}; const m = new Map(); for (let i = 0; i < K; i++) { dObj[keys[i]] = i; m.set(keys[i], i); }
log(`big object fast: ${%HasFastProperties(dObj)}`);
function rObj(n) { let s = 0; for (let i = 0; i < n; i++) s += dObj[keys[(i * 7919) % K]]; return s; }
function rMap(n) { let s = 0; for (let i = 0; i < n; i++) s += m.get(keys[(i * 7919) % K]); return s; }
function wObj(n) { const x = {}; for (let i = 0; i < n; i++) x[keys[i % K]] = i; return x; }
function wMap(n) { const x = new Map(); for (let i = 0; i < n; i++) x.set(keys[i % K], i); return x; }
function t(f) { f(1e4); f(1e4); const a = now(); f(1e7); return (now() - a).toFixed(1); }
for (let r = 0; r < 3; r++) log(`rep${r}: read dict-object ${t(rObj)} | read Map ${t(rMap)} | build object ${t(wObj)} | build Map ${t(wMap)}`);
