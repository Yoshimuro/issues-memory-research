// Does a LoadIC go polymorphic when a property value becomes null, then undefined?
// Run one kind per process (arg): smi | double | string | object
const log = typeof print === 'function' ? print : console.log;
const K = typeof process !== 'undefined' ? process.argv[2] : arguments[0];
function mk(i){
  if (K==='smi') return {q: i};
  if (K==='double') return {q: i+0.5};
  if (K==='string') return {q: 's'+i};
  return {q: {x:i}};
}
function g(o){ return o.q; }
const arr=[]; for (let i=0;i<50;i++) arr.push(mk(i));
for (let r=0;r<20;r++) for (const o of arr) g(o);
const before = arr[1];
arr[0].q = null;
log('after null: sameMap(arr0,arr1)='+%HaveSameMap(arr[0],arr[1]));
g(arr[0]);           // IC sees arr0
g(arr[1]);           // IC sees an old-map object (may be deprecated)
arr[2].q = undefined;
g(arr[2]);
for (const o of arr) g(o);
log('#### kind='+K+' final sameMap(arr0,arr1)='+%HaveSameMap(arr[0],arr[1]));
%DebugPrint(g);
