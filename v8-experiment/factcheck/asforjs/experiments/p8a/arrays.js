const log = typeof print === 'function' ? print : console.log;
function ek(a) { const s = %DebugPrint(a); }
function info(name, a) {
  log(`${name}: smiEl=${%HasSmiElements(a)} dblEl=${%HasDoubleElements(a)} objEl=${%HasObjectElements(a)} holey=${%HasHoleyElements(a)} dict=${%HasDictionaryElements(a)}`);
}
info('Array.from({length:5}, () => 0)', Array.from({ length: 5 }, () => 0));
info('Array.from({length:5}, (_, i) => i)', Array.from({ length: 5 }, (_, i) => i));
info('new Array(5).fill(0)', new Array(5).fill(0));
info('Array(5).fill(0) then all set', (() => { const a = new Array(5).fill(0); for (let i = 0; i < 5; i++) a[i] = i; return a; })());
info('[] + push x5', (() => { const a = []; for (let i = 0; i < 5; i++) a.push(0); return a; })());
info('Array.from(new Array(5).fill(0))', Array.from(new Array(5).fill(0)));
info('[...Array(5)].map(()=>0)', [...Array(5)].map(() => 0));
// transitions
const t = [1, 2, 3]; info('[1,2,3]', t);
const hn = 2 ** 40; t.push(hn); info('push 2**40 (HeapNumber value)', t);
t.push(1.5); info('push 1.5', t);
t.push('s'); info('push "s"', t);
t.length = 3; t[0] = 1; info('after truncating back to ints (irreversible?)', t);
const u = [1, 2, 3]; u.push(undefined); info('[1,2,3].push(undefined)', u);
const h = [1, 2, 3]; h[10] = 4; info('[1,2,3]; a[10]=4', h);
