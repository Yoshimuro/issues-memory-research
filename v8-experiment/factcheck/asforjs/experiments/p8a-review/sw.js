// switch vs if-chain: does an unseen value deopt when case bodies have no feedback-carrying ops?
const log = typeof print === 'function' ? print : console.log;
function opt(f, warm) { %PrepareFunctionForOptimization(f); warm(); warm(); %OptimizeFunctionOnNextCall(f); warm(); }
// dense Smi cases, constant bodies
function sw(x) { switch (x) { case 0: return 'a'; case 1: return 'b'; case 2: return 'c'; case 3: return 'd'; case 4: return 'e'; case 5: return 'f'; default: return 'z'; } }
function ifc(x) { if (x === 0) return 'a'; else if (x === 1) return 'b'; else if (x === 2) return 'c'; else if (x === 3) return 'd'; else if (x === 4) return 'e'; else if (x === 5) return 'f'; return 'z'; }
// sparse / non-Smi cases (strings)
function sws(x) { switch (x) { case 'a': return 1; case 'b': return 2; case 'c': return 3; default: return 0; } }
opt(sw, () => { for (let i = 0; i < 10; i++) sw(i & 1); });
opt(ifc, () => { for (let i = 0; i < 10; i++) ifc(i & 1); });
opt(sws, () => { for (let i = 0; i < 10; i++) sws((i & 1) ? 'a' : 'b'); });
log('--- sw(4) unseen case'); sw(4);
log('--- ifc(4) unseen branch'); ifc(4);
log('--- sws("c") unseen case'); sws('c');
log('--- done');
