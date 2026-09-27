// Generate modules with the same data as an object literal and as JSON.parse('...')
const fs = require('fs');
function data(n){ const a = []; for (let i = 0; i < n; i++) a.push({id: i, name: 'user' + i, tags: ['a', 'b'], score: i * 1.5, ok: i % 2 === 0}); return a; }
for (const [label, n] of [['1k', 12], ['10k', 120], ['100k', 1200], ['1m', 12000]]) {
  const d = data(n); const json = JSON.stringify(d);
  fs.writeFileSync(__dirname + `/lit-${label}.js`, `module.exports = ${json};\n`);
  fs.writeFileSync(__dirname + `/json-${label}.js`, `module.exports = JSON.parse(${JSON.stringify(json)});\n`);
  console.log(label, 'json bytes', json.length);
}
