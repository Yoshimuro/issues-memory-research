const log = typeof print === 'function' ? print : console.log;
function opt(f, warm) { %PrepareFunctionForOptimization(f); warm(); warm(); %OptimizeFunctionOnNextCall(f); warm(); }
// callbacks
function apply(cb, x) { return cb(x); }
const f1 = x => x + 1, f2 = x => x + 2;
opt(apply, () => { for (let i = 0; i < 10; i++) apply(f1, i); });
log('--- apply(f2) after optimizing with f1'); apply(f2, 1);
// object with method, different objects same shape different method
function applyObj(o, x) { return o.run(x); }
const o1 = { run: f1 }, o2 = { run: f2 };
opt(applyObj, () => { for (let i = 0; i < 10; i++) applyObj(o1, i); });
log('--- applyObj(o2) after optimizing with o1'); applyObj(o2, 1);
// if-chain vs switch: warm with 1,2 ; probe with 3
function viaIf(x) { if (x === 1) return 10; else if (x === 2) return 20; else if (x === 3) return 30 + x * 2; return 0; }
function viaSwitch(x) { switch (x) { case 1: return 10; case 2: return 20; case 3: return 30 + x * 2; default: return 0; } }
opt(viaIf, () => { for (let i = 0; i < 10; i++) viaIf(1 + (i & 1)); });
opt(viaSwitch, () => { for (let i = 0; i < 10; i++) viaSwitch(1 + (i & 1)); });
log('--- viaIf(3)'); viaIf(3);
log('--- viaSwitch(3)'); viaSwitch(3);
log('--- viaIf(4) / viaSwitch(4) (fall-through default)'); 
function viaIf2(x) { if (x === 1) return 10; else if (x === 2) return 20; return 0; }
function viaSwitch2(x) { switch (x) { case 1: return 10; case 2: return 20; default: return 0; } }
opt(viaIf2, () => { for (let i = 0; i < 10; i++) viaIf2(1 + (i & 1)); });
opt(viaSwitch2, () => { for (let i = 0; i < 10; i++) viaSwitch2(1 + (i & 1)); });
viaIf2(4); viaSwitch2(4);
log('--- done');
