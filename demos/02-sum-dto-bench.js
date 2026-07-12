// Демо 2 (ворклоад): суммирование массива из 1000 DTO {price, qty}.
// 500 итераций прогрева + 20000 измеряемых. Работает и в node, и в d8.
// Сам по себе флагов не ставит — тир ограничивает запускающий процесс (см. 02-tier-ladder-run.js).
const now = typeof performance !== 'undefined' ? () => performance.now() : () => Date.now();
const out = typeof print === 'function' ? print : console.log;

const DTO_COUNT = 1000;
const WARMUP = 500;
const ITERS = 20_000;

const items = new Array(DTO_COUNT);
for (let i = 0; i < DTO_COUNT; i++) {
  items[i] = { price: (i % 97) + 0.5, qty: ((i * 7) % 13) + 1 };
}

function sumTotal(list) {
  let total = 0;
  for (let i = 0; i < list.length; i++) {
    total += list[i].price * list[i].qty;
  }
  return total;
}

let sink = 0;
for (let i = 0; i < WARMUP; i++) sink += sumTotal(items);

const t0 = now();
for (let i = 0; i < ITERS; i++) sink += sumTotal(items);
const t1 = now();

out(JSON.stringify({ benchMs: +(t1 - t0).toFixed(3), sink }));
