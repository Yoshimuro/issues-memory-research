// Are strings collected "last"? node --expose-gc strings-gc.js
const MB = (x) => (x / 1048576).toFixed(1) + ' MB';
function used() { gc(); gc(); return process.memoryUsage().heapUsed; }
const holder = {};
let u0 = used();
holder.strs = []; for (let i = 0; i < 1e6; i++) holder.strs.push('key_' + i + '_' + Math.random());   // plain heap strings
holder.objs = []; for (let i = 0; i < 1e6; i++) holder.objs.push({ i });                               // plain objects
let u1 = used(); console.log('strings + objects alive        +' + MB(u1 - u0));
holder.strs = null; let u2 = used(); console.log('after dropping strings, 1 GC:  +' + MB(u2 - u0) + ' (strings freed: ' + MB(u1 - u2) + ')');
holder.objs = null; let u3 = used(); console.log('after dropping objects, 1 GC:  +' + MB(u3 - u0));
// Internalized strings (used as property keys) are removed from the weak string table too
holder.o = {}; for (let i = 0; i < 3e5; i++) { const k = 'prop_' + i + '_' + Math.random(); holder.o[k] = 1; }
let u4 = used(); holder.o = null; let u5 = used();
console.log('dict with 300k internalized keys: +' + MB(u4 - u3) + ', after drop: +' + MB(u5 - u3));
