// Санити: число уникальных hidden classes результата варианта на 1000 записях датасета.
// Запуск: node --allow-natives-syntax shapes-sanity.js <variant-name>
'use strict';
const fs = require('fs');
const path = require('path');
const name = process.argv[2];
const { normalizeUser } = require(path.join(__dirname, 'variants', name + '.js'));
const lines = fs.readFileSync(path.join(__dirname, 'dataset.ndjson'), 'utf8')
  .split('\n').filter(Boolean).slice(0, 1000);
const reps = [];
for (const l of lines) {
  const o = normalizeUser(JSON.parse(l));
  if (!reps.some(r => %HaveSameMap(r, o))) reps.push(o);
}
console.log(JSON.stringify({ variant: name, shapes: reps.length }));
