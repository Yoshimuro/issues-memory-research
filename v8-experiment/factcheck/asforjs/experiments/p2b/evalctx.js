function withEval(s){ var x = 1; eval(s); return x; }
function withWith(o){ with (o) { return y; } }
withEval(''); withWith({y:1});
