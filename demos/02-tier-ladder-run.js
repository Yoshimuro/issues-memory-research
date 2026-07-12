// Демо 2 (раннер): лестница тиров на одном ворклоаде через --max-opt=0/1/2/3.
// Запуск: node demos/02-tier-ladder-run.js   (RUNS=5 по умолчанию, можно RUNS=10)
import { mean, stddev, fmt } from './lib/stats.js';
import { runJson } from './lib/run.js';

const BENCH = new URL('./02-sum-dto-bench.js', import.meta.url).pathname;
const RUNS = +(process.env.RUNS ?? 5);

const TIERS = [
  [0, 'ignition'],
  [1, 'sparkplug'],
  [2, 'maglev'],
  [3, 'turbofan'],
];

console.log(`node ${process.version}, V8 ${process.versions.v8}, прогонов на тир: ${RUNS}\n`);

const results = {};
for (const [n, name] of TIERS) {
  const times = [];
  for (let r = 0; r < RUNS; r++) {
    times.push(runJson(process.execPath, [`--max-opt=${n}`, BENCH]).benchMs);
  }
  results[name] = times;
  console.log(
    `--max-opt=${n} (${name.padEnd(9)}): ${fmt(times)}  [${times.map((t) => t.toFixed(0)).join(', ')}]`,
  );
}

const speedup = (slow, fast) => (mean(results[slow]) / mean(results[fast])).toFixed(2);
console.log('');
console.log(`Sparkplug поверх Ignition:            x${speedup('ignition', 'sparkplug')}`);
console.log(`именно Maglev (max-opt=2 vs 1):       x${speedup('sparkplug', 'maglev')}`);
console.log(`TurboFan поверх Maglev (3 vs 2):      x${speedup('maglev', 'turbofan')}`);
console.log(`вся лестница (TurboFan vs Ignition):  x${speedup('ignition', 'turbofan')}`);
