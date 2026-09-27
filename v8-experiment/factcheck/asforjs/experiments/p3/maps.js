const log = typeof print === 'function' ? print : console.log;
const S = (a,b) => %HaveSameMap(a,b);
// doc code block l.438-445
const a = {name: 'x', age: 1}, b = {name: 'y', age: 2}, c = {age: 2, name: 'y'};
log('a~b', S(a,b), 'a~c', S(a,c));
a[10] = 1; log('after a[10]=1 a~b', S(a,b));
a.z = 1; log('after a.z=1 a~b', S(a,b));
// {a:2} vs {a:3}
log('{a:2}~{a:3}', S({a:2},{a:3}));
// two {} ; a.x ; b.x
const e1 = {}, e2 = {}; log('{}~{}', S(e1,e2)); e1.x=1; log('after e1.x', S(e1,e2)); e2.x=1; log('after e2.x', S(e1,e2));
// constructors
function C1(){ this.name='a'; this.age=1; } function C2(){ this.name='a'; this.age=1; }
log('C1~C1', S(new C1, new C1), 'C1~C2', S(new C1, new C2), 'literal~C1', S({name:'a',age:1}, new C1));
// if in constructor changing order
function C3(f){ if(f){this.x=1;this.y=2}else{this.y=2;this.x=1} }
log('C3 order', S(new C3(true), new C3(false)));
// literal with Object.create(null)
// classes
class K1 { constructor(){ this.name='a'; this.age=1; } } class K2 { #p = 1; constructor(){ this.name='a'; this.age=1; } }
log('K1~K1', S(new K1, new K1), 'K1~C1', S(new K1, new C1), 'K2~K2', S(new K2, new K2));
// values: string -> number
const v1 = {p:'s'}, v2 = {p:'s'}; log('v same', S(v1,v2)); v1.p = 5; log('after p string->smi', S(v1,v2));
const d1 = {q:1}, d2 = {q:1}; d1.q = 1.5; log('after q smi->double', S(d1,d2), 'd2 map deprecated? new {q:1} ~ d1', S({q:1}, d1));
// numeric keys
const o1 = {x:1}, o2 = {x:1}; o1['10']=1; log("o1['10']", S(o1,o2)); o1[0]='str'; log('o1[0]', S(o1,o2)); o1.u=true; log('o1.u', S(o1,o2));
// index range
const r1 = {x:1}, r2={x:1}, r3={x:1}; r1[2**32-2]=1; r2[2**32-1]=1; log('idx 2^32-2', S(r1,r3), 'idx 2^32-1', S(r2,r3));
// '0' vs 0, non-canonical
const k = {}; k['0']=1; k[0]=2; log('keys', JSON.stringify(Object.keys(k)), k['0']);
const nc1 = {x:1}, nc2 = {x:1}; nc1['01']=1; log("'01' non-canonical changes map", !S(nc1,nc2));
const nc3 = {x:1}; nc3['1.0']=1; log("'1.0' non-canonical changes map", !S(nc3,nc2));
// arrays 3 vs 10000
const A3=[1,2,3]; const A1e4=[]; for(let i=0;i<10000;i++) A1e4.push(i); log('arr3~arr10000(push)', S(A3,A1e4));
const H=new Array(10000).fill(0); log('arr3~new Array(10000).fill(0)', S(A3,H), %HasHoleyElements(H));
// Map key order
log('Map order', S(new Map([['a',1],['b',2]]), new Map([['b',2],['a',1]])));
// delete last property vs middle
const dl = {a:1,b:2}, dr={a:1,b:2}; delete dl.b; log('delete last: fast?', %HasFastProperties(dl), 'same as {a:1}+b? ', S(dl,{a:1}));
const dm = {a:1,b:2}; delete dm.a; log('delete first: fast?', %HasFastProperties(dm));
const dt = {}; dt.a=1; dt.b=2; delete dt.b; const dt2={}; dt2.a=1; log('delete last (added): fast?', %HasFastProperties(dt), 'same map as {}+a', S(dt,dt2));
