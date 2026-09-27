// Stack: spread-argument limit, recursion depth vs locals, tail calls.
var out = (typeof print === 'function') ? print : console.log;
function doName() { return arguments.length; }
function spreadOk(n) { try { doName(...new Array(n)); return true; } catch (e) { return e instanceof RangeError ? false : e; } }
var lo = 1000, hi = 1e7;
while (hi - lo > 100) { var mid = (lo + hi) >> 1; if (spreadOk(mid) === true) lo = mid; else hi = mid; }
out('max spread args ~ ' + lo + '  (' + String(spreadOk(hi) === false ? 'RangeError above' : '?') + ')');
try { doName(...new Array(320000)); out('320k: ok'); } catch (e) { out('320k: ' + e.message); }
try { doName(...new Array(120000)); out('120k: ok'); } catch (e) { out('120k: ' + e.message); }
function depth0(n) { try { return depth0(n + 1); } catch (e) { return n; } }
function depth5(n) { var a = n + 1, b = a * 2, c = b - 3, d = c ^ 5, e2 = d | 1; try { return depth5(n + 1) + a + b + c + d + e2; } catch (e) { return n; } }
out('recursion depth, no locals: ' + depth0(0));
out('recursion depth, 5 locals:  ' + depth5(0));
function tail(n) { 'use strict'; if (n === 0) return 'done'; return tail(n - 1); }
try { out('strict tail call 1e6: ' + tail(1e6)); } catch (e) { out('strict tail call 1e6: ' + e.constructor.name + ': ' + e.message); }
