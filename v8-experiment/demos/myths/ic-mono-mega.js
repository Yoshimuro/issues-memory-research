const log = typeof console !== 'undefined' ? console.log.bind(console) : print;
const now = () => performance.now();
function bench(fn, warm, iters) { for (let i=0;i<warm;i++) fn();
  const t0 = now(); for (let i=0;i<iters;i++) fn(); return now() - t0; }
function med(runs) { const a=[...runs].sort((x,y)=>x-y); return a[a.length>>1]; }
// Изоляция кейсов: раннер приклеивает `globalThis.CASE='4'` первой строкой,
// тогда прогоняется ровно один кейс. Без CASE — все (демо-режим).
const CASE = typeof globalThis.CASE !== 'undefined' ? String(globalThis.CASE) : null;

const makers = [
  () => ({ x:1 }), () => ({ a:0, x:1 }), () => ({ b:0, c:0, x:1 }),
  () => ({ d:0, e:0, f:0, x:1 }), () => ({ g:0, x:1, h:0 }),
  () => ({ i:0, j:0, x:1, k:0 }), () => ({ l:0, x:1 }),
  () => ({ m:0, n:0, o:0, p:0, x:1 }),
];
function build(n){ const r=[]; for(let i=0;i<10000;i++) r.push(makers[i%n]()); return r; }
// ИЗОЛЯЦИЯ: на каждый кейс своя функция суммирования — feedback не смешивается
function makeSum(){ return function(objs){ let s=0; for(let i=0;i<objs.length;i++) s+=objs[i].x; return s; }; }
const list = CASE ? [+CASE] : [1, 2, 4, 8];
const results = {};
for (const n of list) {
  const objs = build(n), sum = makeSum();
  const runs = []; for (let r=0;r<5;r++) runs.push(bench(()=>sum(objs), 200, 2000));
  results[n] = med(runs);
  log(JSON.stringify({ bench:'ic', case: n+'-shapes', ms:+results[n].toFixed(1) }));
}
if (!CASE) log('mega/mono = x' + (results[8]/results[1]).toFixed(2));
