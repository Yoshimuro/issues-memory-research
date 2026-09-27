// NOTE: 'x'.repeat()/new Array(n).join() give tiny cons trees, so the string is flattened explicitly.
// (1) Meteor-style replaceThing leak (Meteor blog, 2013) on current Node.
// (2) two-level nesting: does the deep closure retain arr it never uses?
const MB = (x) => (x / 1048576).toFixed(1) + ' MB';
function used() { gc(); gc(); return process.memoryUsage().heapUsed; }
let theThing = null;
function replaceThing() {
  const originalThing = theThing;
  const unused = function () { if (originalThing) console.log('hi'); };
  const ls = 'x'.repeat(1e6) + Math.random(); %FlattenString(ls);
  theThing = { longStr: ls, someMethod: function () { return 1; } };
}
let u0 = used();
for (let i = 0; i < 20; i++) replaceThing();
let u1 = used();
console.log('meteor replaceThing x20: heap +' + MB(u1 - u0), '(no leak: ~+1 MB, leak: ~+20 MB)');
theThing = null; let u2 = used(); console.log('after theThing = null: +' + MB(u2 - u0));

function mk2level() { const arr = new Array(1e6).fill(1.5); const small = 7;
  return function mid() { return function deep() { return small; }; }; }
function mk2levelUse() { const arr = new Array(1e6).fill(1.5); const small = 7;
  return function mid() { return function deep() { return arr[10]; }; }; }
const keep = [];
let v0 = used(); for (let i = 0; i < 10; i++) keep.push(mk2level()()); let v1 = used();
console.log('2-level deep uses only small, 10 closures: +' + MB(v1 - v0));
v0 = used(); for (let i = 0; i < 10; i++) keep.push(mk2levelUse()()); v1 = used();
console.log('2-level deep uses arr[10], 10 closures:    +' + MB(v1 - v0));
