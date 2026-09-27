const MB = (x) => (x / 1048576).toFixed(2) + ' MB';
function used() { gc(); gc(); return process.memoryUsage().heapUsed; }
let u0 = used();
let s = new Array(1e6).join('*');
console.log('one join string: +' + MB(used() - u0), s.length);
%DebugPrint(s.length ? {x: s.slice(0,3)} : 0);
let theThing = null;
function replaceThing() {
  const originalThing = theThing;
  const unused = function () { if (originalThing) console.log('hi'); };
  theThing = { longStr: 'x'.repeat(1e6) + Math.random(), someMethod: function () { return 1; } };
}
u0 = used();
for (let i = 0; i < 20; i++) replaceThing();
console.log('meteor x20 with flat 1MB strings: +' + MB(used() - u0));
%DebugPrint(theThing.someMethod);
