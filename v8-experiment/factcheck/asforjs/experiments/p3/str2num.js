const log = typeof print === 'function' ? print : console.log;
function Ctor(){ this.name='n'; this.age=1; }
function getName(o){ return o.name; }            // pure property access
function useName(o){ return o.name.length; }    // uses value as string
function isOpt(f){ const s=%GetOptimizationStatus(f); return (s & 16) !== 0 || (s & 32) !== 0; }
const a=new Ctor(), b=new Ctor(); b.name='m'; // make field mutable first (const->mutable) so only representation matters
for (const f of [getName, useName]) { %PrepareFunctionForOptimization(f); f(a); f(b); %OptimizeFunctionOnNextCall(f); f(a); }
log('MARK optimized', isOpt(getName), isOpt(useName));
const c=new Ctor(); log('MARK set c.name = 5 (string->number on another object, no call)'); c.name=5;
log('MARK after modification getName opt:', isOpt(getName), ' useName opt:', isOpt(useName));
getName(c); log('MARK after getName(c):', isOpt(getName));
