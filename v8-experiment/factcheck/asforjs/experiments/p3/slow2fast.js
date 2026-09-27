const log = typeof print === 'function' ? print : console.log;
const pr = {a:1,b:2,c:3}; delete pr.a; log('pr dictionary:', !%HasFastProperties(pr));
const q = Object.create(pr);
function rd(o){ return o.zzz; }
for (let i=0;i<10;i++) rd(q);
log('pr fast after being used as prototype in IC lookups:', %HasFastProperties(pr));
const d = {a:1,b:2,c:3}; delete d.a; %ToFastProperties(d); log('%ToFastProperties -> fast:', %HasFastProperties(d));
// in-object limits
let src='this.p0=0;'; for(let i=1;i<300;i++) src+=`this.p${i}=${i};`; const Big = new Function(src); const bo = new Big();
let lit='({'; for(let i=0;i<300;i++) lit+=`p${i}:${i},`; lit+='})'; const bl = eval(lit);
let lit2='({'; for(let i=0;i<200;i++) lit2+=`p${i}:${i},`; lit2+='})'; const bl2 = eval(lit2);
log('ctor with 300 this.x: fast', %HasFastProperties(bo)); %DebugPrint(bo.__proto__ && bo);
