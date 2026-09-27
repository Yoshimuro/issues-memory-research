// line 232: "ветки по типу — мономорфны каждая": does each branch get its own feedback slot?
function oneSite(o) { return o.v; }
function branchedSameLoad(o) { if (o.kind === 1) return o.v; else return o.v; }   // same `o.v` text in both branches
function branchedArith(x) { if (typeof x === 'number') return x + 1; else return x + 1; } // same `x + 1`
const A = () => ({ kind: 1, v: 1 }), B = () => ({ v: 2, kind: 2 }); // two different maps
for (let i = 0; i < 100; i++) {
  oneSite(A()); oneSite(B()); branchedSameLoad(A()); branchedSameLoad(B());
  branchedArith(i); branchedArith('s');
}

