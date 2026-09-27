// Find the minimal index i such that a 10-element packed array becomes DICTIONARY_ELEMENTS after a[i] = 1
const log = (typeof print === 'function') ? print : console.log;
function mk() { const a = []; for (let i = 0; i < 10; i++) a.push(i); return a; }
let first = -1;
for (let i = 10; i < 3000; i++) { const a = mk(); a[i] = 1; if (%HasDictionaryElements(a)) { first = i; break; } }
log('10-element array (capacity 17 after push): first dict index = ' + first);
for (const i of [1030, 1039, 1040, 1041, 1045]) { const a = mk(); a[i] = 1; log('a[' + i + '] dict=' + %HasDictionaryElements(a)); }
{ const a = mk(); a[1020] = 1; log('a[1020] dict=' + %HasDictionaryElements(a)); a[2580] = 1; log(' then a[2580] dict=' + %HasDictionaryElements(a)); }
{ const a = [1,2,3,4,5,6,7,8,9,10]; let f=-1; for (let i = 10; i < 3000; i++) { const b = a.slice(); b[i] = 1; if (%HasDictionaryElements(b)) { f = i; break; } } log('literal/slice 10 elems (capacity 10): first dict index = ' + f); }
{ const a = mk(); Object.defineProperty(a, 0, { value: 5, writable: true, enumerable: true, configurable: true }); log('defineProperty default attrs dict=' + %HasDictionaryElements(a)); }
{ const a = mk(); Object.defineProperty(a, 0, { value: 5, writable: false }); log('defineProperty writable:false dict=' + %HasDictionaryElements(a)); }
{ const a = mk(); Object.defineProperty(a, 'foo', { value: 5 }); log('defineProperty named prop dict elements=' + %HasDictionaryElements(a)); }
{ const a = mk(); Object.defineProperty(a, 0, { get() { return 1; } }); log('defineProperty accessor on index dict=' + %HasDictionaryElements(a)); }
{ const a = new Array(5e6); log('new Array(5e6) dict=' + %HasDictionaryElements(a) + ' holey=' + %HasHoleyElements(a)); }
{ const a = new Array(4e7); log('new Array(4e7) dict=' + %HasDictionaryElements(a)); }
