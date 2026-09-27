// Smi -> Double: new map (deprecation) or in-place? Constructor vs literal objects.
const log = typeof print === 'function' ? print : console.log;
function P(v){ this.x = v; this.k = 1; }
const a = new P(0), b = new P(0);
a.x = 1.5;
log('ctor: sameMap(a,b) after a.x=1.5', %HaveSameMap(a, b));
const c = {y: 0, k: 1}, d = {y: 0, k: 1};
c.y = 1.5;
log('literal: sameMap(c,d) after c.y=1.5', %HaveSameMap(c, d));
const e = {z: 0}, f = {z: 0};
e.z = 1.5;
log('literal 1 prop: sameMap(e,f) after e.z=1.5', %HaveSameMap(e, f));
