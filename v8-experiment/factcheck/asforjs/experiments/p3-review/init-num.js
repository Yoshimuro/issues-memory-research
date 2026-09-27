const log = typeof print === 'function' ? print : console.log;
function isOpt(f){ const s=%GetOptimizationStatus(f); return (s & 16) !== 0 || (s & 32) !== 0; }
const MODE = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
function P(init){ this.x = init; this.k = 1; }
const cases = { nullobj: [null, {q:1}], nanfrac: [NaN, 1.5], zerofrac: [0, 1.5], negzerofrac: [-0, 1.5], zeroint: [0, 7] };
const [init, later] = cases[MODE];
const a = new P(init), b = new P(init);
function get(o){ return o.x; }
%PrepareFunctionForOptimization(get); get(a); get(b); %OptimizeFunctionOnNextCall(get); get(a);
a.x = later;
log(MODE, 'sameMap(a,b) after store:', %HaveSameMap(a, b), '| reader still optimized before next call:', isOpt(get));
get(b);
log(MODE, 'reader optimized after next call:', isOpt(get));
