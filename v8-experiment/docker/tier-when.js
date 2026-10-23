// На каком вызове и через сколько миллисекунд функция попадает на каждый ярус — для функций разного «веса».
// node --allow-natives-syntax docker/tier-when.js [tiny|medium|loop]
'use strict';
const kind = process.argv[2] || 'tiny';
const u = { id: 1, plan: 'pro', credits: 5, referrer: 'r', trialUntil: 1, teamId: 't', name: 'n', email: 'e' };
function tiny(o) { let s = o.credits * 2; if (o.plan === 'pro') s += 100; if (o.referrer) s += 10; if (o.trialUntil) s += 5; if (o.teamId) s += 3; return s; }
function medium(o) {            // ~10× больше байткода, без циклов
  let s = 0;
  s += o.credits * 2; if (o.plan === 'pro') s += 100; if (o.referrer) s += 10; if (o.trialUntil) s += 5; if (o.teamId) s += 3;
  s += o.id * 3; if (o.name === 'n') s += 7; if (o.email) s += 11; if (o.credits > 3) s -= 2; if (o.id < 5) s += 1;
  s += o.credits * 5; if (o.plan !== 'free') s += 13; if (o.referrer === 'r') s += 17; if (o.trialUntil > 0) s += 19; if (o.teamId === 't') s += 23;
  s += o.id * 7; if (o.name) s += 29; if (o.email === 'e') s += 31; if (o.credits < 9) s -= 3; if (o.id > 0) s += 2;
  s += o.credits * 9; if (o.plan) s += 37; if (o.referrer) s += 41; if (o.trialUntil) s += 43; if (o.teamId) s += 47;
  return s;
}
const arr = Array.from({ length: 200 }, (_, i) => ({ ...u, credits: i }));
function loop(list) { let s = 0; for (let i = 0; i < list.length; i++) { const o = list[i]; s += o.credits * 2; if (o.plan === 'pro') s += 100; if (o.referrer) s += 10; } return s; }
const fn = { tiny, medium, loop }[kind], arg = kind === 'loop' ? arr : u;
const BITS = { sparkplug: 1 << 15, maglev: 1 << 5, turbofan: 1 << 6 }, seen = {};
let sink = 0;
function drive() {
  const t0 = process.hrtime.bigint();
  for (let i = 1; i <= 3000000 && !seen.turbofan; i++) {
    sink += fn(arg); const st = %GetOptimizationStatus(fn);
    for (const k in BITS) if (!seen[k] && (st & BITS[k])) seen[k] = { call: i, ms: +(Number(process.hrtime.bigint() - t0) / 1e6).toFixed(1) };
  }
}
%NeverOptimizeFunction(drive);
drive();
console.log(kind.padEnd(7), JSON.stringify(seen));
