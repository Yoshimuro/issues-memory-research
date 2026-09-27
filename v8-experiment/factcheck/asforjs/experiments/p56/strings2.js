// Cross-engine string representation checks. Run: <engine> --allow-natives-syntax strings2.js | grep -E '^===|type:'
var out = (typeof print === 'function') ? print : (s) => require('fs').writeSync(1, s + '\n');
function p(label, s) { out('=== ' + label); %DebugPrint(s); }
var m = 'мурыч', hm = 'хмурыч', sp = ' ';
p("vars 'мурыч'+'хмурыч' (11)", m + hm);
p("vars 'мурыч'+' '+'мурыч' (11)", m + sp + m);
var a = 'asin', t = 'atan';
p("vars asin+atan (8)", a + t);
var s26 = 'abcdefghijklmnopqrstuvwxyz';
var l6 = s26.slice(0, 6), r6 = s26.slice(6, 12), r7 = s26.slice(6, 13);
p("concat 12", l6 + r6);
p("concat 13", l6 + r7);
p("slice 12", s26.slice(0, 12));
p("slice 13", s26.slice(0, 13));
var ghost = String.fromCodePoint(0x1F47B), lat = 'murych';
p("'murych'+ghost (8)", lat + ghost);
p("ghost*10+'мурыч'", ghost.repeat(10) + m);
var src = 'ABC RDF DEF';
p("small replace middle", src.replace('RDF', ''));
p("small replace edge", src.replace('ABC', ''));
var big = 'a'.repeat(5e6) + 'NEEDLE' + 'b'.repeat(5e6);
p("big.replace('NEEDLE','X') (string pattern)", big.replace('NEEDLE', 'X').length > 0 ? big.replace('NEEDLE', 'X') : 0);
