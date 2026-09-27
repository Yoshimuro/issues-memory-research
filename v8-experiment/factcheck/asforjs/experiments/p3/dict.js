const log = typeof print === 'function' ? print : console.log;
function firstSlowKeyed(){ const o={}; for(let i=0;i<5000;i++){ o['p'+i]=i; if(!%HasFastProperties(o)) return i+1; } return 'never'; }
function firstSlowNamedEval(){ // named stores o.pN = ..., generated
  let src='const o={};'; for(let i=0;i<1100;i++) src+=`o.p${i}=${i}; if(!%HasFastProperties(o)) return ${i+1};`; src+='return "never"';
  return new Function(src)(); }
log('keyed o["p"+i] loop: dictionary after N props =', firstSlowKeyed());
log('named o.pN stores: dictionary after N props =', firstSlowNamedEval());
// 100 named in loop (doc exp)
const h={}; for(let i=0;i<100;i++) h['p'+i]=i; log('100 keyed props fast?', %HasFastProperties(h));
// 100 numeric keys
const n={}; for(let i=0;i<100;i++) n[i]=i; log('100 numeric keys fast props?', %HasFastProperties(n), 'dict elements?', %HasDictionaryElements(n));
// Object.assign with dict source
const lit={a:1,b:2}; const as=Object.assign({}, h, lit); log('Object.assign({},dict,lit) fast?', %HasFastProperties(as));
const as2=Object.assign({}, lit); log('Object.assign({},lit) fast?', %HasFastProperties(as2));
// JSON roundtrip of dict object
const j=JSON.parse(JSON.stringify(h)); log('JSON roundtrip of 100-prop dict fast?', %HasFastProperties(j));
const dd={a:1,b:2,c:3}; delete dd.a; log('after delete fast?', %HasFastProperties(dd)); const jj=JSON.parse(JSON.stringify(dd)); log('JSON roundtrip after delete fast?', %HasFastProperties(jj));
// dictionary -> fast via prototype
const pr={a:1,b:2,c:3}; delete pr.a; log('pr dict', !%HasFastProperties(pr)); function F(){}; F.prototype=pr; new F(); const q=Object.create(pr); q.x; log('pr fast after becoming prototype?', %HasFastProperties(pr));
// defineProperty variants
const d1={}; Object.defineProperty(d1,'x',{value:1,writable:true,enumerable:true,configurable:true}); log('defineProperty default-attrs fast?', %HasFastProperties(d1), 'same map as {}.x=?', %HaveSameMap(d1, (()=>{const t={}; t.x=1; return t})()));
const d2={}; Object.defineProperty(d2,'x',{value:1}); log('defineProperty readonly fast?', %HasFastProperties(d2));
const d3={}; Object.defineProperty(d3,'x',{get(){return 1}}); log('defineProperty getter fast?', %HasFastProperties(d3));
const d4={a:1}; Object.defineProperty(d4,'a',{value:2,writable:false}); log('redefine existing attrs fast?', %HasFastProperties(d4));
// freeze
const fz={a:1,b:2}; Object.freeze(fz); log('frozen obj fast?', %HasFastProperties(fz));
const fa=[1,2,3]; Object.freeze(fa); log('frozen array dict elements?', %HasDictionaryElements(fa));
// setPrototypeOf
const sp={a:1}; Object.setPrototypeOf(sp, {}); log('after setPrototypeOf fast?', %HasFastProperties(sp));
const fnp=function(){}; Object.setPrototypeOf(fnp, null); log('fn setPrototypeOf(null) fast?', %HasFastProperties(fnp));
