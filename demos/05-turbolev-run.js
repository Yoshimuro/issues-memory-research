// Демо 5 (раннер, d8 14.x): проверка флагов --turbolev / --turboshaft и бенч
// из демо 2 с --turbolev и без, 10 прогонов, среднее ± ст. отклонение.
// Запуск: node demos/05-turbolev-run.js   (пути к d8: D8_14=..., D8=...)
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mean, fmt } from './lib/stats.js';
import { runJson, D8_14, D8_LATEST } from './lib/run.js';

const BENCH = new URL('./02-sum-dto-bench.js', import.meta.url).pathname;
const RUNS = +(process.env.RUNS ?? 10);

function flagDefault(d8, flag) {
  const lines = spawnSync(d8, ['--help'], { encoding: 'utf8' }).stdout.split('\n');
  const i = lines.findIndex((l) => l.trimStart().startsWith(`--${flag} (`));
  if (i < 0) return null;
  const desc = lines[i].trim().slice(`--${flag} (`.length, -1);
  const def = lines[i + 1]?.match(/default: (\S+)/)?.[1] ?? '?';
  return { desc, def };
}

function checkEngine(d8, label) {
  const version = spawnSync(d8, ['-e', 'print(version())'], { encoding: 'utf8' }).stdout.trim();
  console.log(`=== ${label}: V8 ${version} ===`);
  for (const flag of ['turbolev', 'turboshaft']) {
    const info = flagDefault(d8, flag);
    if (!info) {
      console.log(`--${flag}: флаг НЕ найден`);
      continue;
    }
    const enabled = info.def === `--${flag}`;
    console.log(`--${flag}: есть, по умолчанию ${enabled ? 'ВКЛЮЧЕН' : 'выключен'} (${info.def})`);
    console.log(`   (${info.desc})`);
  }
  console.log('');
  return version;
}

const version14 = checkEngine(D8_14, 'd8 14.x');
if (existsSync(D8_LATEST)) checkEngine(D8_LATEST, 'd8 последний из jsvu');

console.log(`Бенч демо 2 (1000 DTO, 20k итераций) на d8 14.x, прогонов: ${RUNS}\n`);
const results = {};
for (const flags of [['--no-turbolev'], ['--turbolev'], []]) {
  const label = flags[0] ?? '(без флагов)';
  const times = [];
  for (let r = 0; r < RUNS; r++) {
    times.push(runJson(D8_14, [...flags, BENCH]).benchMs);
  }
  results[label] = times;
  console.log(`${label.padEnd(15)}: ${fmt(times)}  [${times.map((t) => t.toFixed(1)).join(', ')}]`);
}

const delta = mean(results['--no-turbolev']) / mean(results['--turbolev']);
console.log(`\nTurbolev vs TurboFan на этом бенче: x${delta.toFixed(2)} (V8 ${version14})`);
console.log(
  '(без флагов) совпадает с --no-turbolev => Turbolev по умолчанию ВЫКЛЮЧЕН в этой версии',
);

if (existsSync(D8_LATEST)) {
  console.log(`\nТот же бенч на последнем d8, прогонов: ${RUNS}\n`);
  for (const flags of [['--no-turbolev'], ['--turbolev']]) {
    const times = [];
    for (let r = 0; r < RUNS; r++) {
      times.push(runJson(D8_LATEST, [...flags, BENCH]).benchMs);
    }
    console.log(`${flags[0].padEnd(15)}: ${fmt(times)}  [${times.map((t) => t.toFixed(1)).join(', ')}]`);
  }
}
