const log = typeof console !== 'undefined' ? console.log : print;
const a = []; for (let i = 0; i < 70000; i++) a.push(i);
log('push 70000: smi=', %HasSmiElements(a), 'holey=', %HasHoleyElements(a), 'dictionary=', %HasDictionaryElements(a));
const b = new Array(70000);
log('new Array(70000): holey=', %HasHoleyElements(b), 'dictionary=', %HasDictionaryElements(b));
const c = new Array(40 * 1024 * 1024);
log('new Array(40M): dictionary=', %HasDictionaryElements(c));
const d = []; d[5000] = 1;
log('[] then d[5000]=1 (gap > kMaxGap 1024): dictionary=', %HasDictionaryElements(d));
const e = []; e[1000] = 1;
log('[] then e[1000]=1 (gap < 1024): dictionary=', %HasDictionaryElements(e));
// capacity growth: old + old/2 + 16
