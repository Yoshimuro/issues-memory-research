// Демо 1: Maglev жив на Node 24 — функция средней горячести проходит лестницу тиров.
// Запуск: node demos/01-maglev-alive.js  (сам перезапустит себя с --allow-natives-syntax)
import { spawnSync } from 'node:child_process';

if (!process.execArgv.includes('--allow-natives-syntax')) {
  const r = spawnSync(process.execPath, ['--allow-natives-syntax', import.meta.filename], {
    stdio: 'inherit',
  });
  process.exit(r.status ?? 1);
}

// %-natives завёрнуты в new Function, чтобы файл парсился и без флага.
const activeTier = new Function(
  'f',
  `
  if (%ActiveTierIsTurbofan(f))  return 'turbofan';
  if (%ActiveTierIsMaglev(f))    return 'maglev';
  if (%ActiveTierIsSparkplug(f)) return 'sparkplug';
  return 'ignition';
`,
);

function mediumHot(a, b) {
  let s = 0;
  for (let i = 0; i < 20; i++) s += (a * 3 + i) ^ (b - i);
  return s;
}

const MAX_CALLS = 500_000;
console.log(`node ${process.version}, V8 ${process.versions.v8}`);

let prev = activeTier(mediumHot);
console.log(`вызов       0: ${prev}`);

let sink = 0;
let maglevFrom = -1;
let turbofanAt = -1;

for (let i = 1; i <= MAX_CALLS; i++) {
  sink += mediumHot(i, i + 1);
  const t = activeTier(mediumHot);
  if (t !== prev) {
    console.log(`вызов ${String(i).padStart(7)}: ${prev} -> ${t}`);
    if (t === 'maglev' && maglevFrom < 0) maglevFrom = i;
    if (t === 'turbofan') {
      turbofanAt = i;
      prev = t;
      break;
    }
    prev = t;
  }
  if (i === 10_000) {
    console.log(
      `вызов   10000: активный тир = ${t}, %ActiveTierIsMaglev = ${t === 'maglev'}`,
    );
  }
}

console.log('---');
if (maglevFrom > 0 && turbofanAt > 0) {
  console.log(
    `Maglev-окно: вызовы ~${maglevFrom}..${turbofanAt - 1} ` +
      `(${turbofanAt - maglevFrom} вызовов до тир-апа в TurboFan)`,
  );
} else if (maglevFrom > 0) {
  console.log(`Maglev активен с вызова ~${maglevFrom}, TurboFan не наступил за ${MAX_CALLS} вызовов`);
} else {
  console.log(`Maglev не наблюдался за ${MAX_CALLS} вызовов (tier-ап ушёл сразу в ${prev})`);
}
console.log(`sink=${sink}`);
