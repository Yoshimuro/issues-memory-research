// Does an IC go polymorphic when a property value becomes null, then undefined?
// Variants by initial value representation.
const log = typeof print === 'function' ? print : console.log;
function slotState(f){ /* printed via %DebugPrint in debug d8 */ }
function mk(kind){
  const arr=[];
  for (let i=0;i<50;i++){
    if (kind==='smi') arr.push({q: i});
    else if (kind==='double') arr.push({q: i+0.5});
    else if (kind==='string') arr.push({q: 's'+i});
    else if (kind==='object') arr.push({q: {x:i}});
  }
  return arr;
}
const kinds=['smi','double','string','object'];
const getters = {
  smi: function(o){ return o.q; },
  double: function(o){ return o.q; },
  string: function(o){ return o.q; },
  object: function(o){ return o.q; },
};
for (const k of kinds){
  const g = getters[k];
  const arr = mk(k);
  const m0 = arr[1];
  for (let r=0;r<20;r++) for (const o of arr) g(o);
  arr[0].q = null;       // one object: null
  for (const o of arr) g(o);
  arr[2].q = undefined;  // later: undefined
  for (const o of arr) g(o);
  log('#### kind='+k+' sameMap(arr0,arr1)='+%HaveSameMap(arr[0],arr[1])+' sameMap(arr0,arr2)='+%HaveSameMap(arr[0],arr[2]));
  %DebugPrint(g);
}
