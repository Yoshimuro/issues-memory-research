const log = typeof console !== 'undefined' ? console.log.bind(console) : print;
const now = () => performance.now();
function bench(fn, warm, iters) { for (let i=0;i<warm;i++) fn();
  const t0 = now(); for (let i=0;i<iters;i++) fn(); return now() - t0; }
function med(runs) { const a=[...runs].sort((x,y)=>x-y); return a[a.length>>1]; }
const CASE = typeof globalThis.CASE !== 'undefined' ? String(globalThis.CASE) : null;
// 'naive-pair': оба наивных замера в ОДНОМ процессе — это и есть "наивная"
// методология (сравнение без изоляции); по отдельности разница исчезает.
const want = c => !CASE || CASE === c || (CASE === 'naive-pair' && c.indexOf('naive') === 0);

function plain(a,b){ return a*b+a; }
function withTry(a,b){ try { return a*b+a; } catch(e){ return 0; } }
// НАИВНО: меряем сразу, без контроля тиринга внешнего цикла
function naiveBench(fn){ let s=0; const t0=now();
  for(let i=0;i<20000000;i++) s+=fn(i%1000,i%7); return now()-t0; }
if (want('naive-plain')) log(JSON.stringify({ bench:'trycatch', case:'naive-plain', ms:+naiveBench(plain).toFixed(0) }));
if (want('naive-try'))   log(JSON.stringify({ bench:'trycatch', case:'naive-try',   ms:+naiveBench(withTry).toFixed(0) }));
// ЧЕСТНО: обёртки-циклы прогреты и форс-оптимизированы
function loopP(){ let s=0; for(let i=0;i<20000000;i++) s+=plain(i%1000,i%7); return s; }
function loopT(){ let s=0; for(let i=0;i<20000000;i++) s+=withTry(i%1000,i%7); return s; }
let t0;
if (want('honest-plain')) {
  %PrepareFunctionForOptimization(loopP);
  loopP(); %OptimizeFunctionOnNextCall(loopP); loopP();
  t0=now(); loopP(); log(JSON.stringify({ bench:'trycatch', case:'honest-plain', ms:+(now()-t0).toFixed(0) }));
}
if (want('honest-try')) {
  %PrepareFunctionForOptimization(loopT);
  loopT(); %OptimizeFunctionOnNextCall(loopT); loopT();
  t0=now(); loopT(); log(JSON.stringify({ bench:'trycatch', case:'honest-try', ms:+(now()-t0).toFixed(0) }));
}
