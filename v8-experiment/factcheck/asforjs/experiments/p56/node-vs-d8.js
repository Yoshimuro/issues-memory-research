// Rough throughput: allocation-heavy + property-access loop. Same file in node24 and d8.
var out = (typeof print === 'function') ? print : console.log;
function work() { var s = 0, list = []; for (var i = 0; i < 3e6; i++) { var o = { a: i, b: [i] }; list.push(o); if (list.length > 1000) list = []; s += o.a + o.b[0]; } return s; }
work();
for (var r = 0; r < 3; r++) { var t = Date.now(); work(); out('run ' + r + ': ' + (Date.now() - t) + ' ms'); }
