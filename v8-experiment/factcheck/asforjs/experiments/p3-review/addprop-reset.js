// Doc l.516: "adding b to {a} resets all caches tied to the object and statistics start over"
const log = typeof print === 'function' ? print : console.log;
function isOpt(f){ const s=%GetOptimizationStatus(f); return (s & 16) !== 0 || (s & 32) !== 0; }
// Case A: object seen via parameter
function getA(o){ return o.a; }
const p = {a: 1};
%PrepareFunctionForOptimization(getA); getA(p); getA(p); %OptimizeFunctionOnNextCall(getA); getA(p);
log('A param: opt before', isOpt(getA));
p.b = 2;
log('A param: opt right after p.b=2 (no call)', isOpt(getA));
getA(p);
log('A param: opt after call', isOpt(getA));
// Case B: a constant object captured by closure (map stability dependency)
const c = {a: 1};
const getC = () => c.a;
%PrepareFunctionForOptimization(getC); getC(); getC(); %OptimizeFunctionOnNextCall(getC); getC();
log('B const: opt before', isOpt(getC));
c.b = 2;
log('B const: opt right after c.b=2 (no call)', isOpt(getC));
if (typeof print === "function") { getA({a:1}); log("#### feedback of getA after"); %DebugPrint(getA); }
