const log = typeof print === 'function' ? print : console.log;
const r1={x:1}; r1[2**32-2]=1; const r2={x:1}; r2[2**32-1]=1;
log('2^32-2 -> elements (dict elements)?', %HasDictionaryElements(r1), ' named props count via map change:', !%HaveSameMap(r1,{x:1}));
log('2^32-1 -> elements?', %HasDictionaryElements(r2), ' fast props?', %HasFastProperties(r2), ' Object.keys order', JSON.stringify(Object.keys({b:1, [2**32-1]:1, 1:1, [2**32-2]:1, a:1})));
const a=[]; a[2**32-2]=1; log('array length after a[2^32-2]', a.length); const b=[]; b[2**32-1]=1; log('array length after b[2^32-1]', b.length);
// key order spec
const o={}; o.b=1; o[2]=1; o.a=1; o[1]=1; o[Symbol.for('s')]=1; log('Reflect.ownKeys', Reflect.ownKeys(o).map(String).join(','));
let fi=[]; for (const k in {z:1, 10:1, y:1, 3:1}) fi.push(k); log('for-in order', fi.join(','));
