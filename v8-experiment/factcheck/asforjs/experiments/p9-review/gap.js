// line 1273: at which index does a single far write turn an array into DICTIONARY elements (kMaxGap=1024)?
const log = typeof console !== 'undefined' ? console.log : print;
function firstDict(make) { for (let n = 900; n < 1300; n++) { const a = make(); a[n] = 1; if (%HasDictionaryElements(a)) return n; } return 'none'; }
log('[] ->', firstDict(() => []));
log('[1,2,3,4,5] ->', firstDict(() => [1, 2, 3, 4, 5]));
log('new Array(5) ->', firstDict(() => new Array(5)));
log('push x5 (cap 17) ->', firstDict(() => { const a = []; for (let i = 0; i < 5; i++) a.push(i); return a; }));
