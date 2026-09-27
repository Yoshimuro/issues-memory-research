// Doc l.492: doExpr.counter changes the function's hidden class and deoptimizes code tied to it.
// Test: code that uses a property of a function object (fn.call / fn.length / fn.name) depends on the function map.
const log = typeof print === 'function' ? print : console.log;
function isOpt(f){ const s=%GetOptimizationStatus(f); return (s & 16) !== 0 || (s & 32) !== 0; }
function doExpr(x){ return x + 1; }
function other(x){ return x * 2; }
// user1: calls doExpr via .call (loads 'call' from doExpr -> depends on doExpr's map)
function user1(v){ return doExpr.call(null, v); }
// user2: reads doExpr.length
function user2(){ return doExpr.length; }
// user3: plain call doExpr(v) (call target identity only)
function user3(v){ return doExpr(v); }
// user4: other.call - different function sharing the same initial map
function user4(v){ return other.call(null, v); }
for (const f of [user1,user2,user3,user4]) { %PrepareFunctionForOptimization(f); f(1); f(2); %OptimizeFunctionOnNextCall(f); f(3); }
log('before: u1', isOpt(user1), 'u2', isOpt(user2), 'u3', isOpt(user3), 'u4', isOpt(user4));
log('sameMap(doExpr, other) before', %HaveSameMap(doExpr, other));
doExpr[0] = 1;
log('after doExpr[0]=1: u1', isOpt(user1), 'u2', isOpt(user2), 'u3', isOpt(user3), 'u4', isOpt(user4), 'sameMap', %HaveSameMap(doExpr, other));
doExpr.counter = 1;
log('after doExpr.counter=1 (no call): u1', isOpt(user1), 'u2', isOpt(user2), 'u3', isOpt(user3), 'u4', isOpt(user4), 'sameMap', %HaveSameMap(doExpr, other));
user1(1); user2(); user3(1); user4(1);
log('after calls: u1', isOpt(user1), 'u2', isOpt(user2), 'u3', isOpt(user3), 'u4', isOpt(user4));
