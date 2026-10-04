const fs = require('fs');
const rows = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map(JSON.parse);
const ok = rows.filter(r => !r.error && r.correct !== false);
const broken = rows.filter(r => r.error);
const wrong = rows.filter(r => r.correct === false);
const by = {}; ok.forEach(r => by[r.ic] = (by[r.ic] || 0) + 1);
const med = a => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
console.log('--- СВОДКА', process.argv[2], '---');
console.log('всего генераций :', rows.length);
console.log('рабочих         :', ok.length, '| битых:', broken.length, '| некорректных:', wrong.length);
console.log('IC-распределение:', JSON.stringify(by));
if (ok.length) {
  console.log('shapes медиана  :', med(ok.map(r => r.shapes)));
  console.log('p50 медиана     :', med(ok.map(r => r.p50_ms)), 'ms');
  console.log('deopts медиана  :', med(ok.map(r => r.deopts)));
}
