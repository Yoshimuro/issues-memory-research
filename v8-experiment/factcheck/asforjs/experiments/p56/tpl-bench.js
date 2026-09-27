// Template literal vs + vs tagged template, same process, 3 rounds.
var out = (typeof print === 'function') ? print : console.log;
function tag(s, a, b) { return s[0] + a + s[1] + b + s[2]; }
function viaPlus(a, b) { return 'x' + a + '-' + b + 'y'; }
function viaTpl(a, b) { return `x${a}-${b}y`; }
function viaTag(a, b) { return tag`x${a}-${b}y`; }
function bench(f) { var n = 0, t = Date.now(); for (var i = 0; i < 5e6; i++) n += f(i, 'k').length; return Date.now() - t; }
for (var r = 0; r < 4; r++) out('round ' + r + ': plus ' + bench(viaPlus) + ' ms, tpl ' + bench(viaTpl) + ' ms, tagged ' + bench(viaTag) + ' ms');
