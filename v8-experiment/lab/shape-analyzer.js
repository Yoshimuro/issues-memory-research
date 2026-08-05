// Прибор эксперимента: модуль с normalizeUser -> вердикт JSON (последней строкой)
// Запуск: node --allow-natives-syntax shape-analyzer.js <candidate.js>
'use strict';
const p = process.argv[2];
if (!p) { console.log(JSON.stringify({ error: 'no path' })); process.exit(1); }

let normalize;
try {
  const mod = require(require('path').resolve(p));
  normalize = mod.normalizeUser || (typeof mod === 'function' ? mod : null);
} catch (e) {
  console.log(JSON.stringify({ error: 'require failed: ' + e.message.slice(0, 80) }));
  process.exit(0);
}
if (typeof normalize !== 'function') {
  console.log(JSON.stringify({ error: 'no normalizeUser export' })); process.exit(0);
}

function makeRaw(i) {
  const r = { id: i, name: 'u' + i, email: i % 3 ? 'e' + i : undefined,
              plan: i % 2 ? 'pro' : undefined, credits: i % 5 ? i : undefined };
  if (i % 2) r.referrer = 'ref' + i;
  if (i % 3 === 0) r.trialUntil = 1700000000 + i;
  if (i % 7 === 0) r.teamId = 't' + (i % 40);
  return r;
}

function score(u) {
  let s = (u.credits ?? 0) * 2;
  if (u.plan === 'pro') s += 100;
  if (u.referrer) s += 10;
  if (u.trialUntil) s += 5;
  if (u.teamId) s += 3;
  return s;
}
const REFERENCE_CHECKSUM = 2002854764;

try {
  const reps = [];
  for (let i = 0; i < 1000; i++) {
    const o = normalize(makeRaw(i));
    if (o == null || typeof o !== 'object') throw new Error('not an object');
    if (!reps.some(r => %HaveSameMap(r, o))) reps.push(o);
  }
  const users = [];
  for (let i = 0; i < 50000; i++) users.push(normalize(makeRaw(i)));
  let checksum = 0;
  for (const u of users) checksum += score(u);
  const lat = [];
  for (let req = 0; req < 700; req++) {
    const t0 = process.hrtime.bigint();
    let t = 0;
    for (let i = 0; i < users.length; i++) t += score(users[i]);
    lat.push(Number(process.hrtime.bigint() - t0) / 1e6);
  }
  const steady = lat.slice(100).sort((a, b) => a - b);
  const p50 = steady[Math.floor(steady.length * 0.5)];
  const ic = reps.length === 1 ? 'MONO' : reps.length <= 4 ? 'POLY' : 'MEGA';
  console.log(JSON.stringify({
    shapes: reps.length, ic, p50_ms: +p50.toFixed(2),
    correct: checksum === REFERENCE_CHECKSUM
  }));
} catch (e) {
  console.log(JSON.stringify({ error: 'runtime: ' + e.message.slice(0, 80) }));
}
