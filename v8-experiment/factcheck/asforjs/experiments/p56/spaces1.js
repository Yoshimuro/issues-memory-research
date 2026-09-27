// Which generation: d8 --allow-natives-syntax spaces1.js ; node --allow-natives-syntax spaces1.js
var out = (typeof print === 'function') ? print : console.log;
function lit() { return [1, 2, 3]; }
function litd() { return [1.5, 2.5]; }
var a = lit(), d = litd(), n = new Array(3), s = 'ABC', m2 = 'Math2', c = s + String(Math.random());
function rest({x, ...r}) { return r; }
var r = rest({x: 1, y: 2, z: 3});
out('array literal JSArray young:     ' + %InYoungGeneration(a));
out('new Array(3) young:              ' + %InYoungGeneration(n));
out('double literal JSArray young:    ' + %InYoungGeneration(d));
out("literal 'ABC' young:             " + %InYoungGeneration(s));
out("literal 'Math2' young:           " + %InYoungGeneration(m2));
out('runtime concat young:            ' + %InYoungGeneration(c));
out('rest object young:               ' + %InYoungGeneration(r));
