function lit(o) { o.a = 'status-ready'; o.b = 'status-ready'; return o.c === 'status-ready'; }
function ident(o) { const S = 'status-ready'; o.a = S; o.b = S; return o.c === S; }
const S2 = 'status-ready';
function outerIdent(o) { o.a = S2; o.b = S2; return o.c === S2; }
lit({}); ident({}); outerIdent({});
print('same object for literal in two functions: ' + %HaveSameMap('x','x'));
