// Workload with real library code (npm's bundled semver, minimatch, diff, postcss-selector-parser)
// to collect TurboFan / Maglev compile times from --trace-opt ("took a, b, c ms").
const base = '/opt/nvm/versions/node/v24.21.0/lib/node_modules/npm/node_modules/';
const semver = require(base + 'semver');
const { minimatch } = require(base + 'minimatch');
const diff = require(base + 'diff');
const psp = require(base + 'postcss-selector-parser');
let acc = 0;
const t0 = Date.now();
for (let r = 0; r < 300; r++) {
  for (let i = 0; i < 50; i++) {
    acc += semver.satisfies(`${i % 7}.${i % 13}.${r % 5}`, '^1.2.0 || >=3.0.0 <5 || 6.x') ? 1 : 0;
    acc += minimatch(`src/dir${i}/file${r}.js`, 'src/**/file*.{js,ts}') ? 1 : 0;
  }
  acc += diff.diffLines('a\nb\nc\n' + r, 'a\nB\nc\n' + (r + 1)).length;
  acc += psp().processSync(`div.a${r} > span#x${r}:hover, ul li[data-x="${r}"]`).length;
}
console.log('acc', acc, 'ms', Date.now() - t0);
