// does function f({...rest}) normalize differently-shaped inputs into one map?
const print = globalThis.print || console.log;
function f({...rest}) { return rest; }
class P { constructor() { this.a = 1; this.b = 2; } }
const inA = new P();
const inB = {a: 1, b: 2};
const inC = Object.create({z: 0}); inC.a = 1; inC.b = 2;
const inD = {b: 2, a: 1};
const inE = {a: 1.5, b: 2};
const inF = {a: 1, b: 2, c: 3};
print('inputs A(class) vs B(literal) same map: ' + %HaveSameMap(inA, inB));
const rA = f(inA), rB = f(inB), rC = f(inC), rD = f(inD), rE = f(inE), rF = f(inF);
print('rest(A) vs rest(B) same map (class vs literal, same keys order): ' + %HaveSameMap(rA, rB));
print('rest(A) vs rest(C) same map (proto differs): ' + %HaveSameMap(rA, rC));
print('rest(A) vs rest(D) same map (key order b,a): ' + %HaveSameMap(rA, rD));
print('rest(A) vs rest(E) same map (a double): ' + %HaveSameMap(rA, rE));
print('rest(A) vs rest(F) same map (extra key): ' + %HaveSameMap(rA, rF));
