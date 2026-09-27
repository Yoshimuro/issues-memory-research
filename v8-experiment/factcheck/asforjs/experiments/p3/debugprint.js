const log = typeof print === 'function' ? print : console.log;
function P(label, o){ log('### '+label); %DebugPrint(o); }
const o1 = {name:'x'}; P('literal {name}', o1);
o1.h = 47; P('literal {name} + h', o1);
function Ctor(){ this.a=1; this.b=2; }
const c1 = new Ctor(); P('new Ctor (2 props), 1st instance', c1);
c1.p = 10; P('new Ctor + p', c1);
for (let i=0;i<20;i++) new Ctor();
const c2 = new Ctor(); P('new Ctor after 20 instances (slack tracking done)', c2);
class K { constructor(){ this.a=1; this.b=2; } } P('class K 2 props', new K());
const l2 = {a:1,b:2}; l2.p=1; l2.p2=2; l2.p3=3; P('literal 2 + p,p2,p3', l2);
l2.p4=4; P('literal 2 + p..p4', l2);
P('empty literal {}', {});
P('JSON.parse 3 keys', JSON.parse('{"a":1,"b":"s","c":3}'));
const big = JSON.parse('{' + Array.from({length:30},(_, i)=>`"k${i}":${i}`).join(',') + '}'); P('JSON.parse 30 keys', big);
function restf({...r}){ return r; } P('rest {...r} of literal {a,b}', restf({a:1,b:2}));
P('empty array', []);
function lazyFn(){ return 1; } P('function before call', lazyFn);
P('Symbol', Symbol('s'));
