const log = console.log.bind(console);
const now = () => performance.now();
function bench(fn, warm, iters) { for (let i=0;i<warm;i++) fn();
  const t0 = now(); for (let i=0;i<iters;i++) fn(); return now() - t0; }
function med(runs) { const a=[...runs].sort((x,y)=>x-y); return a[a.length>>1]; }
function makeObj(){ return { a:1, b:2, c:3, d:4, e:5 }; }
const fast = makeObj();
const del  = makeObj(); delete del.c;
const undf = makeObj(); undf.c = undefined;
function makeRead(){ return function(o){ return o.a+o.b+o.d+o.e; }; }
for (const [name, o] of [['delete',del],['fast',fast],['undefined',undf]]) {
  const read = makeRead();
  const runs=[]; for(let r=0;r<5;r++) runs.push(bench(()=>{ let s=0; for(let i=0;i<100000;i++) s+=read(o); return s; }, 20, 50));
  log(JSON.stringify({ case:name, ms:+med(runs).toFixed(1) }));
}
