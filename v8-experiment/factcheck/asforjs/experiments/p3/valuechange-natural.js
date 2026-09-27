const log = typeof print === 'function' ? print : console.log;
function Ctor(a){ this.name='n'; this.age=a; }
function doGetAge(o){ return o.age; }
const objs=[]; for (let i=0;i<100;i++) objs.push(new Ctor(i));
let s=0; for (let r=0;r<3000;r++) for (const o of objs) s+=doGetAge(o);
log('MARK status before value change', %GetOptimizationStatus(doGetAge).toString(2));
objs[0].age = 42;  // first re-assignment of the field after construction
log('MARK status after value change', %GetOptimizationStatus(doGetAge).toString(2));
for (let r=0;r<3000;r++) for (const o of objs) s+=doGetAge(o);
log('MARK status after rewarm', %GetOptimizationStatus(doGetAge).toString(2));
objs[1].age = 43; log('MARK status after 2nd value change', %GetOptimizationStatus(doGetAge).toString(2));
