// На каком вызове функция попадает в каждый ярус: node --allow-natives-syntax tier-threshold.js
'use strict';
const { normalizeUser } = require('../lab/ref-a.js');
function score(u) { let s = u.credits * 2; if (u.plan === 'pro') s += 100; if (u.referrer) s += 10; if (u.trialUntil) s += 5; if (u.teamId) s += 3; return s; }
const u = normalizeUser({ id: 1, plan: 'pro', credits: 5, referrer: 'r', trialUntil: 1, teamId: 't' });
const B = { baseline: 1 << 15, maglev: 1 << 5, turbofan: 1 << 6 }; const seen = {};
let sink = 0;
function drive() { for (let i = 1; i <= 3000000; i++) { sink += score(u); const st = %GetOptimizationStatus(score);
  for (const k in B) if (!seen[k] && (st & B[k])) seen[k] = i; } }
%NeverOptimizeFunction(drive); // иначе score растворяется в цикле и сам не поднимается
drive();
console.log(JSON.stringify(seen), sink > 0);
