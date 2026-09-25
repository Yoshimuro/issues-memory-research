'use strict';
// detect-workload.js — нагрузка для «продакшн»-способов детекции (без natives):
// --prof, --log-function-events, --trace-event-categories, --cpu-prof.
// 8 функций с говорящими именами, вызываются через мегаморфный call-site fns[i & 7],
// чтобы их НЕ заинлайнили в цикл и они оставались отдельными code-объектами в профиле.
function tierProbe0(o) { let s = 0; for (let k = 0; k < 16; k++) s += o.a * k + o.b - o.c; return s; }
function tierProbe1(o) { let s = 1; for (let k = 0; k < 16; k++) s += o.b * k + o.c - o.d; return s; }
function tierProbe2(o) { let s = 2; for (let k = 0; k < 16; k++) s += o.c * k + o.d - o.e; return s; }
function tierProbe3(o) { let s = 3; for (let k = 0; k < 16; k++) s += o.d * k + o.e - o.a; return s; }
function tierProbe4(o) { let s = 4; for (let k = 0; k < 16; k++) s += o.e * k + o.a - o.b; return s; }
function tierProbe5(o) { let s = 5; for (let k = 0; k < 16; k++) s += o.a * k + o.c - o.e; return s; }
function tierProbe6(o) { let s = 6; for (let k = 0; k < 16; k++) s += o.b * k + o.d - o.a; return s; }
function tierProbe7(o) { let s = 7; for (let k = 0; k < 16; k++) s += o.c * k + o.e - o.b; return s; }
const fns = [tierProbe0, tierProbe1, tierProbe2, tierProbe3, tierProbe4, tierProbe5, tierProbe6, tierProbe7];
const o = { a: 1, b: 2, c: 3, d: 4, e: 5 };
function driver() {
  const t0 = Date.now();
  let acc = 0, i = 0;
  while (Date.now() - t0 < 1500) {
    for (let k = 0; k < 2000; k++, i++) acc += fns[i & 7](o);
  }
  return acc;
}
console.log('acc', driver());
