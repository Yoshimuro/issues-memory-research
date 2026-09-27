const log = typeof print === 'function' ? print : console.log;
const MODE = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
function a(){} function b(){}
log('fresh fns same map', %HaveSameMap(a,b));
a[0]=1; log('after a[0]=1 same map', %HaveSameMap(a,b));
b.counter=1; log('after b.counter=1 same map', %HaveSameMap(a,b));
// realistic: hot caller with state on the callee function
function doExprN(){ doExprN.counter = (doExprN.counter|0) + 1; return 1; }
function doExprI(){ doExprI[0] = (doExprI[0]|0) + 1; return 1; }
function hot(fn){ let s=0; for (let i=0;i<1e5;i++) s+=fn(); return s; }
if (MODE==='named') { for (let r=0;r<5;r++) hot(doExprN); log('named counter', doExprN.counter); }
if (MODE==='index') { for (let r=0;r<5;r++) hot(doExprI); log('index counter', doExprI[0]); }
