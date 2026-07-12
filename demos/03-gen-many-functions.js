// Демо 3 (генератор): создаёт 03-many-functions.generated.js — программу со 100
// функциями средней горячести (~940 вызовов каждая, вперемешку мелкими пачками).
//
// Параметры подобраны под окно, где Maglev должен выигрывать (замерено на Node 24 / V8 13.6):
//   - с --maglev функция с таким телом уходит в Maglev на ~130-м вызове,
//     а в TurboFan — только на ~3200-м;
//   - с --no-maglev TurboFan приходит на ~1000-м вызове.
// Значит при ~940 вызовах на функцию конфиг с Maglev почти всё время работает
// в Maglev-коде, а конфиг без Maglev — в Ignition/Sparkplug. При заметно большем
// числе вызовов (3000+) выигрыш исчезает: без Maglev TurboFan приходит раньше
// и его код быстрее Maglev-кода.
// Запуск: node demos/03-gen-many-functions.js
import { writeFileSync } from 'node:fs';

const N_FUNCS = 100;
const ROUNDS = 94;
const CALLS_PER_ROUND = 10; // итого 940 вызовов на функцию
const OPS = ['+', '^', '|', '-'];

// детерминированный PRNG, чтобы файл был воспроизводимым
let seed = 42;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

let src = `// Сгенерировано demos/03-gen-many-functions.js — не редактировать руками.
// ${N_FUNCS} функций средней горячести, по ${ROUNDS * CALLS_PER_ROUND} вызовов каждая (вперемешку).
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const out = typeof print === 'function' ? print : console.log;
const obj = { v0: 1, v1: 2, v2: 3, v3: 4, v4: 5 };
`;

const names = [];
for (let f = 0; f < N_FUNCS; f++) {
  const name = `fn${f}`;
  names.push(name);
  const k1 = 3 + Math.floor(rnd() * 29);
  const k2 = 5 + Math.floor(rnd() * 23);
  const op = OPS[f % OPS.length];
  const loop = 40 + (f % 17);
  src += `function ${name}(a, b, o) { let s = 0; for (let i = 0; i < ${loop}; i++) { s = (s ${op} (a * ${k1} + i)) + ((b - i) % ${k2}) + o.v${f % 5}; } return s | 0; }\n`;
}

src += `
const fns = [${names.join(', ')}];
let sink = 0;
const t0 = now();
for (let round = 0; round < ${ROUNDS}; round++) {
  for (let f = 0; f < fns.length; f++) {
    for (let c = 0; c < ${CALLS_PER_ROUND}; c++) {
      sink += fns[f](round * 7 + c, f * 31 - c, obj);
    }
  }
}
const t1 = now();
out(JSON.stringify({ benchMs: +(t1 - t0).toFixed(3), sink }));
`;

const target = new URL('./03-many-functions.generated.js', import.meta.url).pathname;
writeFileSync(target, src);
console.log(`записан ${target} (${N_FUNCS} функций, по ${ROUNDS * CALLS_PER_ROUND} вызовов)`);
