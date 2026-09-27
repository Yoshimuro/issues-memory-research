// back-to-back ratios inside one process; each case is its own function (no shared harness)
const log = typeof print === 'function' ? print : console.log;
const now = typeof performance !== 'undefined' ? () => performance.now() : Date.now;
const N = 2e7;
function makeObjs(){ const r=[]; for(let i=0;i<64;i++){ const o={name:i, age:i}; o[0]=i; r.push(o);} return r; }
const objs = makeObjs();
function named(){ let s=0; for(let i=0;i<N;i++){ s+=objs[i&63].name; } return s; }
function indexed(){ let s=0; for(let i=0;i<N;i++){ s+=objs[i&63][0]; } return s; }
const plain = {x:1}; const px = new Proxy({x:1}, {}); const pxTrap = new Proxy({x:1}, {get(t,k){ return t[k]; }});
function plainGet(){ let s=0; for(let i=0;i<N/10;i++){ s+=plain.x; plain.x = i&7; } return s; }
function proxyGet(){ let s=0; for(let i=0;i<N/10;i++){ s+=px.x; plain.x = i&7; } return s; }
function proxyTrapGet(){ let s=0; for(let i=0;i<N/10;i++){ s+=pxTrap.x; plain.x = i&7; } return s; }
class G { constructor(){ this._v=1; this.v2=1; } get v(){ return this._v; } }
const gs=[]; for(let i=0;i<64;i++){ const g=new G(); g._v=i; g.v2=i; gs.push(g); }
function viaGetter(){ let s=0; for(let i=0;i<N;i++){ s+=gs[i&63].v; } return s; }
function viaField(){ let s=0; for(let i=0;i<N;i++){ s+=gs[i&63].v2; } return s; }
const keys=[]; for(let i=0;i<1000;i++) keys.push('k'+i);
const dict = {}; for (const k of keys) dict[k]=1; const map = new Map(); for (const k of keys) map.set(k,1);
function dictGet(){ let s=0; for(let i=0;i<N/10;i++){ s+=dict[keys[i%1000]]; } return s; }
function mapGet(){ let s=0; for(let i=0;i<N/10;i++){ s+=map.get(keys[i%1000]); } return s; }
class P2 { constructor(a,b){ this.a=a; this.b=b; } }
let sink;
function makeLiteral(){ let s=0; for(let i=0;i<N/4;i++){ const o={a:i,b:i}; sink=o; s+=o.a; } return s; }
function makeClass(){ let s=0; for(let i=0;i<N/4;i++){ const o=new P2(i,i); sink=o; s+=o.a; } return s; }
function t(f){ const s=now(); f(); return now()-s; }
const pairs = [['named',named,'indexed',indexed],['plainGet',plainGet,'proxyGet',proxyGet],['plainGet',plainGet,'proxyTrapGet',proxyTrapGet],['viaField',viaField,'viaGetter',viaGetter],['mapGet',mapGet,'dictGet',dictGet],['makeLiteral',makeLiteral,'makeClass',makeClass]];
log('dict fast?', %HasFastProperties(dict));
for (const [an,a,bn,b] of pairs){ a(); b(); }
for (let rep=0; rep<3; rep++) for (const [an,a,bn,b] of pairs){ const ta=t(a), tb=t(b); log(`rep${rep} ${an}=${ta.toFixed(1)}ms ${bn}=${tb.toFixed(1)}ms ratio ${bn}/${an}=${(tb/ta).toFixed(2)}`); }
