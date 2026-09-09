const log = typeof console !== 'undefined' ? console.log.bind(console) : print;
const now = () => performance.now();
function bench(fn, warm, iters) { for (let i=0;i<warm;i++) fn();
  const t0 = now(); for (let i=0;i<iters;i++) fn(); return now() - t0; }
function med(runs) { const a=[...runs].sort((x,y)=>x-y); return a[a.length>>1]; }

function makeA(){ return { x:1, y:2 }; }
function makeB(){ return { y:2, x:1 }; }
function makeC(){ const o={}; o.x=1; o.y=2; return o; }
log('A vs A            :', %HaveSameMap(makeA(), makeA()));
log('A vs B (порядок)  :', %HaveSameMap(makeA(), makeB()));
log('A vs C (сборка)   :', %HaveSameMap(makeA(), makeC()));
log('A vs JSON.parse   :', %HaveSameMap(makeA(), JSON.parse('{"x":1,"y":2}')));
