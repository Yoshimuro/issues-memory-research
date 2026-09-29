// Лестница ярусов на ОДНОЙ функции: node --max-opt=N tier-bench.js  (0 Ignition, 1 Sparkplug, 2 Maglev, 3 TurboFan)
// Работа одна и та же, форма одна (ref-a): меряем ярус, не A против B.
// Объекты складываются в массив и читаются вторым проходом — чтобы TurboFan не выкинул аллокацию (escape analysis).
'use strict';
const { normalizeUser } = require('../lab/ref-a.js');
function score(u) { let s = u.credits * 2; if (u.plan === 'pro') s += 100; if (u.referrer) s += 10; if (u.trialUntil) s += 5; if (u.teamId) s += 3; return s; }
const N = 20000, buf = new Array(N);
function pass() {
  for (let i = 0; i < N; i++) buf[i] = normalizeUser({ id: i, name: 'u', email: 'e', plan: i & 1 ? 'pro' : 'free', credits: i, referrer: 'r', trialUntil: 1, teamId: 't' });
  let t = 0; for (let i = 0; i < N; i++) t += score(buf[i]); return t;
}
for (let k = 0; k < 30; k++) pass(); // прогрев до потолка, разрешённого --max-opt
const t0 = process.hrtime.bigint(); let sink = 0;
for (let k = 0; k < 200; k++) sink += pass();
console.log(JSON.stringify({ ms: +(Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1), sink }));
