// Doc l.508/564: "numeric keys do not change the shape and do not deoptimize code"
const log = typeof print === 'function' ? print : console.log;
function isOpt(f){ const s=%GetOptimizationStatus(f); return (s & 16) !== 0 || (s & 32) !== 0; }
function getName(o){ return o.name; }
function mk(){ return {name: 'n', age: 1}; }
const a = mk(), b = mk();
%PrepareFunctionForOptimization(getName); getName(a); getName(b); %OptimizeFunctionOnNextCall(getName); getName(a);
for (let i = 0; i < 100; i++) a[i] = 'str';
log('plain object, 100 dense numeric keys: sameMap', %HaveSameMap(a, b), 'getName still opt after call', (getName(a), isOpt(getName)));
a[5000000] = 1;
log('plain object, sparse index 5e6: sameMap', %HaveSameMap(a, b), 'dictionary elements', %HasDictionaryElements(a));
getName(a);
log('  getName still opt after call', isOpt(getName));
// arrays: elements kind is part of the map
function first(arr){ return arr[0]; }
const x = [1, 2, 3], y = [4, 5, 6];
%PrepareFunctionForOptimization(first); first(x); first(y); %OptimizeFunctionOnNextCall(first); first(x);
x[1] = 1.5;
log('array [1,2,3] after x[1]=1.5: sameMap(x,y)', %HaveSameMap(x, y));
first(x);
log('  first() still opt after call', isOpt(first));
