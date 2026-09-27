// Elements kinds lattice checks. Prints kind via %DebugPrint (grep "elements kind") plus helper intrinsics.
const log = (typeof print === 'function') ? print : console.log;
function k(label, a) { log('== ' + label + ' smi=' + %HasSmiElements(a) + ' dbl=' + %HasDoubleElements(a) + ' obj=' + %HasObjectElements(a) + ' holey=' + %HasHoleyElements(a) + ' dict=' + %HasDictionaryElements(a)); %DebugPrint(a); }
const a = [1, 2, 3]; k('[1,2,3]', a);
a[1] = 1.5; k('a[1]=1.5', a);
a[1] = 'x'; k("a[1]='x'", a);
a[1] = 2; k('a[1]=2 (back to number)', a);
delete a[1]; k('delete a[1]', a);
a[1] = 2; k('a[1]=2 (fill hole)', a);
k('[]', []);
k('[Infinity]->', (() => { const b = [1, 2]; b[0] = Infinity; return b; })());
k('[NaN]->', (() => { const b = [1, 2]; b[0] = NaN; return b; })());
k('[-0]->', (() => { const b = [1, 2]; b[0] = -0; return b; })());
k('[+0]->', (() => { const b = [1, 2]; b[0] = +0; return b; })());
k('[0.0]->', (() => { const b = [1, 2]; b[0] = 0.0; return b; })());
const r = [1, 2, 3]; let s = 0; for (let i = 0; i < 10; i++) s += (r[i] | 0); k('read beyond length', r);
k('new Array(10)', new Array(10));
k('new Array(10).fill(0)', new Array(10).fill(0));
k('Array()', Array());
k('[1,,3]', [1, , 3]);
k('Array.from({length:10},()=>0)', Array.from({ length: 10 }, () => 0));
k('Array.from({length:10},()=>-0)', Array.from({ length: 10 }, () => -0));
k('Array.from({length:10})', Array.from({ length: 10 }));
k('Array.from({length:10},(_, i)=>i)', Array.from({ length: 10 }, (_, i) => i));
k('[1.1,2.2]', [1.1, 2.2]);
const hn = 1.5 * 3;  // double value in a variable (HeapNumber in interpreter)
const d = [1.1, 2.2]; d.push(hn); k('[1.1,2.2].push(heapnumber)', d);
const e = [1, 2]; e.push(hn); k('[1,2].push(heapnumber)', e);
