// Backing-store capacity after pushes/pops/length changes, read from %DebugPrint "- elements: <FixedArray[N]>"
const log = (typeof print === 'function') ? print : console.log;
function cap(label, a) { log('== ' + label + ' length=' + a.length); %DebugPrint(a); }
{ var a = []; cap('[]', a); a.push(1); cap('[] push x1', a); a.push(2); a.push(3); cap('push x3', a);
  for (let i = 3; i < 17; i++) a.push(i); cap('push x17', a); a.push(17); cap('push x18', a);
  for (let i = 18; i < 43; i++) a.push(i); cap('push x43', a); a.push(43); cap('push x44', a); }
{ const b = [1, 2, 3, 4]; cap('[1,2,3,4]', b); b.push(5); cap('[1,2,3,4].push(5)', b); }
{ const c = [9, 10, 11]; c.push(12); cap('[9,10,11].push(12)', c); }
{ const c = [9, 10, 11]; c.push(12, 13, 14); cap('[9,10,11].push(12,13,14)', c); }
{ const d = new Array(10); cap('new Array(10)', d); cap('new Array()', new Array()); cap('Array()', Array()); }
{ const e = [1, 2, 3, 4, 5]; cap('[1,2,3,4,5]', e); }
{ const f = []; for (let i = 0; i < 100; i++) f[i] = i; // grow by index
  cap('index-filled 100', f);
  const g = []; for (let i = 0; i < 100; i++) g.push(i); cap('push-filled 100', g);
  while (g.length > 41) g.pop(); cap('pop down to 41', g);
  while (g.length > 30) g.pop(); cap('pop down to 30', g); }
{ const h = []; for (let i = 0; i < 140; i++) h.push(i); cap('push 140', h); h.length = 70; cap('length=70', h); h.length = 0; cap('length=0', h); }
{ const k = []; k.length = 100; cap('[] then length=100', k); }
{ const m = []; for (let i = 0; i < 100; i++) m.push(i); cap('push 100 (before shift)', m); m.shift(); cap('after shift', m); }
