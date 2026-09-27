// Улика для хука: когда именно у B появляется `reason: wrong map`, а у A — нет.
// Запуск: node --allow-natives-syntax --trace-deopt demo-wrongmap.js <ref-a.js|ref-b.js> | grep score
// Фаза 1: читатель score() разогревается на записях, где все три хвостовых поля есть
//         (у A и у B — одна форма) и компилируется со ставкой на эту форму.
// Фаза 2: приходят записи без части хвостовых полей. У A форма та же; у B — другая.
'use strict';
const { normalizeUser } = require(require('path').resolve(process.argv[2]));

function score(u) {
  let s = u.credits * 2;
  if (u.plan === 'pro') s += 100;
  if (u.referrer) s += 10;
  if (u.trialUntil) s += 5;
  if (u.teamId) s += 3;
  return s;
}

function base(i) { return { id: i, name: 'u' + i, email: 'e' + i, plan: 'pro', credits: i }; }
function full(i) { const r = base(i); r.referrer = 'r' + i; r.trialUntil = 1700000000 + i; r.teamId = 't' + (i % 40); return r; }
function sparse(i) { const r = base(i); if (i % 2) r.referrer = 'r' + i; if (i % 3 === 0) r.trialUntil = 1700000000 + i; if (i % 5 === 0) r.teamId = 't' + (i % 40); return r; }

function drive(make, n) { let t = 0; for (let i = 0; i < n; i++) t += score(normalizeUser(make(i))); return t; }
%NeverOptimizeFunction(drive); // чтобы score компилировался сам, а не растворялся в цикле

console.log('phase 1: все поля есть');
drive(full, 200000);
console.log('phase 2: пошли записи без хвостовых полей');
drive(sparse, 200000);
console.log('done');
