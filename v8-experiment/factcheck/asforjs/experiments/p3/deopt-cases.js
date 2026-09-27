// usage: node --allow-natives-syntax --trace-deopt deopt-cases.js CASE  |  d8 --allow-natives-syntax --trace-deopt deopt-cases.js -- CASE
const log = typeof print === 'function' ? print : console.log;
const CASE = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
function status(f){ return (%GetOptimizationStatus(f) & 16) ? 'TURBOFAN-OPT' : ((%GetOptimizationStatus(f) & 32) ? 'OPT(maglev/other)' : 'not-opt'); }
function isOpt(f){ const s=%GetOptimizationStatus(f); return (s & 16) !== 0 || (s & 32) !== 0 ; }
function optimize(f, ...args){ %PrepareFunctionForOptimization(f); f(...args); f(...args); %OptimizeFunctionOnNextCall(f); f(...args); log('MARK optimized:', isOpt(f)); }
function Ctor(){ this.name='n'; this.age=1; }
function doGetAge(o){ return o.age; }
const cases = {
  sameCtor(){ const a=new Ctor(); optimize(doGetAge,a); log('MARK call 2nd instance'); doGetAge(new Ctor()); log('MARK still opt:', isOpt(doGetAge)); },
  addProp(){ const a=new Ctor(); optimize(doGetAge,a); log('MARK add prop (no call)'); a.extra=1; log('MARK still opt after modification:', isOpt(doGetAge)); log('MARK call'); doGetAge(a); log('MARK still opt:', isOpt(doGetAge)); },
  literalVsCtor(){ optimize(doGetAge,new Ctor()); log('MARK call literal'); doGetAge({name:'n', age:1}); log('MARK still opt:', isOpt(doGetAge)); },
  setProto(){ const a=new Ctor(); optimize(doGetAge,a); log('MARK setPrototypeOf (no call)'); Reflect.setPrototypeOf(a,{}); log('MARK still opt after modification:', isOpt(doGetAge)); log('MARK call'); doGetAge(a); log('MARK still opt:', isOpt(doGetAge)); },
  pathLiteral(){ const o={name:'n',age:1}; o.prop=1; optimize(doGetAge,o); log('MARK call literal {name,age,prop}'); doGetAge({name:'n',age:1,prop:1}); log('MARK still opt:', isOpt(doGetAge)); },
  pathSame(){ const o={name:'n',age:1}; o.prop=1; optimize(doGetAge,o); const o2={name:'n',age:2}; o2.prop=2; log('MARK call same path'); doGetAge(o2); log('MARK still opt:', isOpt(doGetAge)); },
  otherOrder(){ const o={name:'n',age:1}; o.prop=1; optimize(doGetAge,o); const o2={name:'n',prop:1}; o2.age=2; log('MARK call other order'); doGetAge(o2); log('MARK still opt:', isOpt(doGetAge)); },
  deleteProp(){ const o={name:'n',age:1}; o.prop=1; optimize(doGetAge,o); delete o.prop; log('MARK call after delete'); doGetAge(o); log('MARK still opt:', isOpt(doGetAge)); },
  numericKeys(){ const o=new Ctor(); optimize(doGetAge,o); for(let i=0;i<100;i++) o[i]='str'; log('MARK call after 100 numeric keys'); doGetAge(o); log('MARK still opt:', isOpt(doGetAge)); },
  valueSameRepr(){ const o=new Ctor(); optimize(doGetAge,o); o.age=42; log('MARK call after age=42'); doGetAge(o); log('MARK still opt:', isOpt(doGetAge)); },
  valueSmiToDouble(){ const o=new Ctor(); optimize(doGetAge,o); log('MARK set age=1.5 (no call)'); o.age=1.5; log('MARK still opt after modification:', isOpt(doGetAge)); doGetAge(o); log('MARK still opt after call:', isOpt(doGetAge)); },
  valueSmiToString(){ const o=new Ctor(); optimize(doGetAge,o); log('MARK set age="x" (no call)'); o.age='x'; log('MARK still opt after modification:', isOpt(doGetAge)); doGetAge(o); log('MARK still opt after call:', isOpt(doGetAge)); },
  valueSmiToStringUse(){ function useAge(o){ return o.age + 1; } const o=new Ctor(); optimize(useAge,o); const o2=new Ctor(); log('MARK set other obj age="x" (no call)'); o2.age='x'; log('MARK still opt after modification:', isOpt(useAge)); useAge(o); log('MARK still opt after call:', isOpt(useAge)); },
  wrongMapProto(){ function MakeObject(){this.name='n';this.age=1;} function MakeObject2(){this.name='n';this.age=1;} function doThingObject(o){ return o.name; } optimize(doThingObject,new MakeObject()); log('MARK call MakeObject2'); doThingObject(new MakeObject2()); log('MARK still opt:', isOpt(doThingObject)); },
  twoLiterals(){ function f(o){ return o.name; } optimize(f,{name:'a',age:1}); log('MARK call literal same order'); f({name:'b',age:2}); log('MARK still opt:', isOpt(f)); },
  patternParam(){ function f({name, age}){ return age; } optimize(f,new Ctor()); log('MARK call literal'); f({name:'n',age:1}); log('MARK still opt:', isOpt(f)); },
  restParam(){ function f({...r}){ return r.age; } optimize(f,new Ctor()); log('MARK call literal (other proto)'); f({name:'n',age:1}); log('MARK still opt:', isOpt(f)); log('MARK call other order'); f({age:1,name:'n'}); log('MARK still opt:', isOpt(f)); },
  restParamSameOrderManyMaps(){ function f({...r}){ return r.age; } optimize(f,new Ctor()); const inputs=[{name:'n',age:1}, (()=>{const o={}; o.name='n'; o.age=1; return o})(), Object.assign(Object.create({z:1}),{name:'n',age:1}), (()=>{class K{constructor(){this.name='n';this.age=1}}; return new K})()]; for (const [i,x] of inputs.entries()){ log('MARK input', i); f(x); log('MARK still opt:', isOpt(f)); } },
  restExcluded(){ function f({name, ...r}){ return r.age; } optimize(f,new Ctor()); log('MARK call literal'); f({name:'n',age:1}); log('MARK still opt:', isOpt(f)); },
  protoAddOwnLoad(){ const a=new Ctor(); optimize(doGetAge,a); log('MARK Ctor.prototype.foo=1 (no call)'); Ctor.prototype.foo=1; log('MARK still opt after modification:', isOpt(doGetAge)); doGetAge(a); log('MARK still opt after call:', isOpt(doGetAge)); },
  protoAddMethodCall(){ function P(){ this.x=1; } P.prototype.m=function(){ return 1; }; function callM(o){ return o.m(); } const a=new P(); optimize(callM,a); log('MARK P.prototype.other=1 (no call)'); P.prototype.other=1; log('MARK still opt after modification:', isOpt(callM)); callM(a); log('MARK still opt after call:', isOpt(callM)); },
  protoAddMissing(){ function P(){ this.x=1; } function readMissing(o){ return o.alreadyRun; } const a=new P(); optimize(readMissing,a); log('MARK P.prototype.zzz=1 (no call)'); P.prototype.zzz=1; log('MARK still opt after modification:', isOpt(readMissing)); readMissing(a); log('MARK still opt after call:', isOpt(readMissing)); },
  constFieldGlobal(){ globalThis.gobj = {name:'x'}; const f = new Function('return gobj.name'); optimize(f); log('MARK gobj.name="y" (no call)'); gobj.name='y'; log('MARK still opt after modification:', isOpt(f)); f(); log('MARK still opt after call:', isOpt(f)); },
  fnCounterNamed(){ function doExpr(){ return 1; } function caller(){ return doExpr() + doExpr.length; } optimize(caller); log('MARK doExpr.counter=1 (no call)'); doExpr.counter=1; log('MARK still opt after modification:', isOpt(caller)); caller(); log('MARK still opt after call:', isOpt(caller)); },
  fnCounterIndex(){ function doExpr(){ return 1; } function caller(){ return doExpr() + doExpr.length; } optimize(caller); log('MARK doExpr[0]=1 (no call)'); doExpr[0]=1; log('MARK still opt after modification:', isOpt(caller)); caller(); log('MARK still opt after call:', isOpt(caller)); },
  callTarget(){ function doConst7(){ return 7; } function doConst15(){ return 15; } function doThing(fn){ return fn(); } optimize(doThing, doConst7); log('MARK call with doConst15'); doThing(doConst15); log('MARK still opt:', isOpt(doThing)); },
};
cases[CASE]();
