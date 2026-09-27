const log = typeof print === 'function' ? print : console.log;
// m1: null prototype objects
const n1 = Object.create(null); n1.a = 1; n1.b = 2;
const n2 = { __proto__: null, a: 1, b: 2 };
const n3 = { a: 1, b: 2 }; Object.setPrototypeOf(n3, null);
log('Object.create(null) fast props:', %HasFastProperties(n1));
log('{__proto__:null, a, b} fast props:', %HasFastProperties(n2));
log('setPrototypeOf(o, null) fast props:', %HasFastProperties(n3));
log('plain {a,b} fast props:', %HasFastProperties({ a: 1, b: 2 }));
// m2: integer-like keys on a plain object live in elements
const o = { name: 'x' }; o[0] = 'a'; o[5] = 'b'; o['7'] = 'c';
log('plain object with o[0],o[5],o["7"]: HasObjectElements', %HasObjectElements(o), 'fast props', %HasFastProperties(o), 'keys', Object.keys(o).join(','));
