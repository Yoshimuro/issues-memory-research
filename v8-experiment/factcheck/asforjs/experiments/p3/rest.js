const log = typeof print === 'function' ? print : console.log;
function restf({...r}){ return r; }
function Ctor(){ this.a=1; this.b=2; }
const lit = {a:1,b:2};
const rLit = restf({a:1,b:2}), rCtor = restf(new Ctor()), rDyn = restf((()=>{const o={}; o.a=1; o.b=2; return o})());
log('rest(lit) ~ lit', %HaveSameMap(rLit, lit));
log('rest(ctor) ~ rest(lit)', %HaveSameMap(rCtor, rLit), ' rest(ctor) ~ lit', %HaveSameMap(rCtor, lit));
log('rest(dyn {}+a+b) ~ rest(lit)', %HaveSameMap(rDyn, rLit));
const rOrder = restf({b:2,a:1}); log('rest({b,a}) ~ rest({a,b})', %HaveSameMap(rOrder, rLit));
const rDbl = restf({a:1.5,b:2}); log('rest({a:1.5,b}) ~ rest({a:1,b})', %HaveSameMap(rDbl, rLit));
// fresh object each call
const x = {a:1,b:2}; log('rest returns new object', restf(x) !== x);
// array rest creates new array
function arest([h, ...t]){ return t; } const arr=[1,2,3]; log('array rest new array', arest(arr) !== arr, Array.isArray(arest(arr)));
