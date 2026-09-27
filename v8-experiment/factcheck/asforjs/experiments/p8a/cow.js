function lit() { return [1, 2, 3, 4]; }
function litD() { return [1.5, 2.5, 3.5]; }
function litO() { return ['a', 'b', {}]; }
function ctor() { return new Array(1, 2, 3, 4); }
for (let i = 0; i < 3; i++) { lit(); litD(); litO(); ctor(); }
for (const [n, f] of [['lit [1,2,3,4]', lit], ['literal doubles', litD], ['literal w/ object', litO], ['new Array(1,2,3,4)', ctor]]) {
  const a = f(), b = f();
  print(`== ${n}`);
  %DebugPrint(a);
  a[0] = 9;
  print(`-- after write:`); %DebugPrint(a);
}
