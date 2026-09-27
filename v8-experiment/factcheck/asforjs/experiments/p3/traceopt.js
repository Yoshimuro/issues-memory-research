const log = typeof print === 'function' ? print : console.log;
const MODE = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
function Ctor(){ this.name='n'; this.age=1; }
function doGetAge(obj){ return obj.age; }
let s=0;
if (MODE==='loop') { const o=new Ctor(); for (let i=0;i<10000;i++) s+=doGetAge(o); log('MARK deopt now'); s+=doGetAge({age:2}); }
if (MODE==='loop100k') { const o=new Ctor(); for (let i=0;i<100000;i++) s+=doGetAge(o); }
if (MODE==='once') { s+=doGetAge(new Ctor()); }
if (MODE==='forced') { const o=new Ctor(); %PrepareFunctionForOptimization(doGetAge); doGetAge(o); %OptimizeFunctionOnNextCall(doGetAge); doGetAge(o); }
log('done', s);
