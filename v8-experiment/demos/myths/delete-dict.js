const log = typeof console !== 'undefined' ? console.log.bind(console) : print;
const now = () => performance.now();
function bench(fn, warm, iters) { for (let i=0;i<warm;i++) fn();
  const t0 = now(); for (let i=0;i<iters;i++) fn(); return now() - t0; }
function med(runs) { const a=[...runs].sort((x,y)=>x-y); return a[a.length>>1]; }
const CASE = typeof globalThis.CASE !== 'undefined' ? String(globalThis.CASE) : null;

function makeObj(){ return { a:1, b:2, c:3, d:4, e:5 }; }
const fast = makeObj();
const del  = makeObj(); delete del.c;
const undf = makeObj(); undf.c = undefined;
if (!CASE) {
  log('fast HasFastProperties :', %HasFastProperties(fast));
  log('delete HasFastProperties:', %HasFastProperties(del));
  log('undef HasFastProperties :', %HasFastProperties(undf));
}
function makeRead(){ return function(o){ return o.a+o.b+o.d+o.e; }; }
const pairs = [['fast',fast],['delete',del],['undefined',undf]];
for (const [name, o] of (CASE ? pairs.filter(p => p[0] === CASE) : pairs)) {
  const read = makeRead();
  const runs=[]; for(let r=0;r<5;r++) runs.push(bench(()=>{ let s=0; for(let i=0;i<100000;i++) s+=read(o); return s; }, 20, 50));
  log(JSON.stringify({ bench:'delete', case:name, ms:+med(runs).toFixed(1) }));
}
