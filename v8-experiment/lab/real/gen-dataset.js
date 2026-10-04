'use strict';
// Детерминированный генератор датасета: всё от индекса i, никакого Math.random.
// Доли полей — как в lab/shape-analyzer.js makeRaw:
//   email 2/3, plan 1/2, credits 4/5, referrer 1/2, trialUntil 1/3, teamId 1/7.
// Реализм: name/email переменной длины (от i), у 1/10 записей вложенный address,
// который нормализация игнорирует. 200 000 записей в NDJSON.
const fs = require('fs');
const path = require('path');

const N = 200000;
const chunks = [];
let buf = [];
for (let i = 0; i < N; i++) {
  const r = { id: i, name: 'user' + i + '-' + 'x'.repeat(i % 17) };
  if (i % 3) r.email = 'mail' + i + '@' + 'dom'.repeat(1 + (i % 5)) + '.example';
  if (i % 2) r.plan = 'pro';
  if (i % 5) r.credits = i % 1000;
  if (i % 2) r.referrer = 'ref' + (i % 97);
  if (i % 3 === 0) r.trialUntil = 1700000000 + i;
  if (i % 7 === 0) r.teamId = 't' + (i % 40);
  if (i % 10 === 0) r.address = { city: 'city' + (i % 50), country: 'CC' + (i % 20) };
  buf.push(JSON.stringify(r));
  if (buf.length === 10000) { chunks.push(buf.join('\n')); buf = []; }
}
if (buf.length) chunks.push(buf.join('\n'));
fs.writeFileSync(path.join(__dirname, 'dataset.ndjson'), chunks.join('\n') + '\n');
console.log('written', N, 'records');
