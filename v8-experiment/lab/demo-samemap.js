// Live №1 (узел 2): node --allow-natives-syntax lab/demo-samemap.js
'use strict';
const A = require('./ref-a.js').normalizeUser, B = require('./ref-b.js').normalizeUser;
const x = { id: 1, name: 'ann', teamId: 't1' }, y = { id: 2, name: 'bob' };   // y — без teamId
console.log('A:', %HaveSameMap(A(x), A(y)));
console.log('B:', %HaveSameMap(B(x), B(y)));
const seen = [];
for (let m = 0; m < 8; m++) {
  const o = B({ id: m, referrer: m & 1 ? 'r' : undefined, trialUntil: m & 2 ? 1 : undefined, teamId: m & 4 ? 't' : undefined });
  if (!seen.some(s => %HaveSameMap(s, o))) seen.push(o);
}
console.log('форм у B:', seen.length);
