const log = typeof print === 'function' ? print : console.log;
const MODE = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
const obj = {name: 'x', obj1: {name: 'deep'}};
const inobj = {a:1}; // literal
const dictObj = {}; for (let i=0;i<100;i++) dictObj['p'+i] = i;
const numObj = {}; for (let i=0;i<100;i++) numObj[i] = i;
const doGetName = () => obj.name;
const doGetDeep = () => obj.obj1.name;
function getP(o){ return o.p5; }
function getNum(o){ return o[5]; }
function getParam(o){ return o.name; }
function opt(f, a){ %PrepareFunctionForOptimization(f); f(a); f(a); %OptimizeFunctionOnNextCall(f); f(a); }
if (MODE==='name') opt(doGetName);
if (MODE==='deep') opt(doGetDeep);
if (MODE==='dict') opt(getP, dictObj);
if (MODE==='num') opt(getNum, numObj);
if (MODE==='param') opt(getParam, obj);
if (MODE==='poly') { const o2={x:1,name:'b'}, o3={y:1,z:2,name:'c'}; %PrepareFunctionForOptimization(getParam); getParam(obj); getParam(o2); getParam(o3); %OptimizeFunctionOnNextCall(getParam); getParam(obj); }
