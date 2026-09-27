const log = typeof console !== 'undefined' ? console.log : print;
const proto = { hello() { return 1; } };
function A() { this.x = 1; this.y = 2; }
function B() { this.x = 1; this.y = 2; }
A.prototype = proto; B.prototype = proto;
const a = new A(), b = new B(), a2 = new A();
log('same prototype:', Object.getPrototypeOf(a) === Object.getPrototypeOf(b));
log('A vs B same map:', %HaveSameMap(a, b));
log('A vs A same map:', %HaveSameMap(a, a2));
// literals: two identical object literals -> distinct objects, but shared map
const o1 = { p: 1, q: 2 }, o2 = { p: 1, q: 2 };
log('literal o1===o2:', o1 === o2, ' same map:', %HaveSameMap(o1, o2));
const s1 = 'hello world', s2 = 'hello ' + 'world';
log("string literals ===:", s1 === s2);
log('class typeof:', typeof class K {});
