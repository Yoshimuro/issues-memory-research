'use strict';
// trace-demo.js — что печатают --trace-opt / --trace-deopt / --trace-baseline.
// Запуск: node --trace-opt --trace-deopt [--trace-baseline] trace-demo.js
// Без natives: тиры набираются естественно, между фазами ждём по таймеру, чтобы фоновые
// компиляции успели завершиться и попасть в лог.
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Горячая моно-функция: пройдёт Ignition -> Sparkplug -> (Maglev) -> TurboFan.
function hotMono(o) { return o.a * o.b + o.c - o.d + o.e; }

// Функция, которая деоптимизируется: оптимизируем на форме A, потом даём форму B.
function willDeopt(o) { return o.x + o.y; }

(async () => {
  const objA = { a: 1, b: 2, c: 3, d: 4, e: 5 };
  let acc = 0;
  for (let i = 0; i < 30000; i++) acc += hotMono(objA);
  await sleep(100);
  for (let i = 0; i < 1000; i++) acc += hotMono(objA);

  const shapeA = { x: 1, y: 2 };
  for (let i = 0; i < 30000; i++) acc += willDeopt(shapeA);
  await sleep(100);
  for (let i = 0; i < 1000; i++) acc += willDeopt(shapeA);
  console.log('--- now calling willDeopt with a NEW shape {x,y,z} ---');
  const shapeB = { x: 1, y: 2, z: 3 };
  acc += willDeopt(shapeB); // deopt здесь
  for (let i = 0; i < 1000; i++) acc += willDeopt(i & 1 ? shapeA : shapeB);
  await sleep(100);
  console.log('acc =', acc);
})();
