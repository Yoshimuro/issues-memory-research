// Демо 3 (раннер): разгонный сценарий — 80 функций средней горячести,
// общее время с --maglev и с --no-maglev, 10 прогонов, среднее ± ст. отклонение.
// Запуск: node demos/03-gen-many-functions.js && node demos/03-maglev-vs-no-maglev-run.js
import { existsSync } from 'node:fs';
import { mean, fmt } from './lib/stats.js';
import { runJson } from './lib/run.js';

const BENCH = new URL('./03-many-functions.generated.js', import.meta.url).pathname;
if (!existsSync(BENCH)) {
  console.error('сначала сгенерируйте программу: node demos/03-gen-many-functions.js');
  process.exit(1);
}

const RUNS = +(process.env.RUNS ?? 10);
console.log(`node ${process.version}, V8 ${process.versions.v8}, прогонов: ${RUNS}\n`);

const results = {};
for (const flag of ['--maglev', '--no-maglev']) {
  const times = [];
  for (let r = 0; r < RUNS; r++) {
    times.push(runJson(process.execPath, [flag, BENCH]).benchMs);
  }
  results[flag] = times;
  console.log(`${flag.padEnd(12)}: ${fmt(times)}  [${times.map((t) => t.toFixed(0)).join(', ')}]`);
}

const gain = mean(results['--no-maglev']) / mean(results['--maglev']);
console.log(`\nвыигрыш Maglev на разгоне: x${gain.toFixed(2)}`);
