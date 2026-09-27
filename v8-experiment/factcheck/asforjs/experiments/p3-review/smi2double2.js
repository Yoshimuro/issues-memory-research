const log = typeof print === 'function' ? print : console.log;
function P(v){ this.x = v; this.k = 1; }
const a = new P(0), b = new P(0);
function get(o){ return o.x; }
const OPT = (typeof process !== 'undefined' ? process.argv[2] : arguments[0]) === 'opt';
if (OPT) { %PrepareFunctionForOptimization(get); get(a); get(b); %OptimizeFunctionOnNextCall(get); get(a); }
else { get(a); get(b); get(a); }
a.x = 1.5;
log(OPT ? 'with optimized reader' : 'reader only interpreted', 'sameMap(a,b) after a.x=1.5:', %HaveSameMap(a, b));
