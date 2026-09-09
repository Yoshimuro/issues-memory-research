const log = typeof console !== 'undefined' ? console.log.bind(console) : print;
const now = () => performance.now();
function bench(fn, warm, iters) { for (let i=0;i<warm;i++) fn();
  const t0 = now(); for (let i=0;i<iters;i++) fn(); return now() - t0; }
function med(runs) { const a=[...runs].sort((x,y)=>x-y); return a[a.length>>1]; }
const CASE = typeof globalThis.CASE !== 'undefined' ? String(globalThis.CASE) : null;

function makeSmi(){ const a=[]; for(let i=0;i<1000;i++) a.push(i); return a; }
function makeDouble(){ const a=makeSmi(); a[0]=0.5; return a; }
function makeHoley(){ const a=makeSmi(); delete a[500]; a[500]=500; return a; }
// честный "mixed": форсим PACKED_ELEMENTS объектом, потом храним ТОЛЬКО числа
function makeElements(){ const a=[{}]; a[0]=0; for(let i=1;i<1000;i++) a.push(i); return a; }
function makeSum(){ return function(arr){ let s=0; for(let i=0;i<arr.length;i++) s+=arr[i]; return s; }; }
const pairs = [['SMI',makeSmi],['DOUBLE',makeDouble],['HOLEY',makeHoley],['ELEMENTS',makeElements]];
for (const [name, mk] of (CASE ? pairs.filter(p => p[0] === CASE) : pairs)) {
  const arr = mk(), sum = makeSum();
  const runs=[]; for(let r=0;r<5;r++) runs.push(bench(()=>sum(arr), 500, 20000));
  log(JSON.stringify({ bench:'elements', case:name, ms:+med(runs).toFixed(1) }));
}
