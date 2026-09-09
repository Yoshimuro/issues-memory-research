'use strict';
// End-to-end имитация запроса: parse -> normalize -> consume(R проходов) -> serialize.
// Каждая стадия меряется отдельно (hrtime.bigint). Параметры через env:
//   VARIANT (имя файла в variants/), BATCH, R, REP (метка повтора),
//   WARMUP (default 300), MEASURE (default 1000).
// Одна ячейка матрицы = один процесс node (IC/type feedback не текут между вариантами).
const fs = require('fs');
const path = require('path');

const VARIANT = process.env.VARIANT;
const BATCH = +process.env.BATCH;
const R = +process.env.R;
const REP = +(process.env.REP || 0);
const WARMUP = +(process.env.WARMUP || 300);
const MEASURE = +(process.env.MEASURE || 1000);
if (!VARIANT || !BATCH || !R) { console.error('need VARIANT/BATCH/R'); process.exit(1); }

const { normalizeUser } = require(path.join(__dirname, 'variants', VARIANT + '.js'));
const lines = fs.readFileSync(path.join(__dirname, 'dataset.ndjson'), 'utf8')
  .split('\n').filter(Boolean);
const N = lines.length;

// Сливы против DCE: semanticSink должен совпадать между вариантами при равных
// (BATCH, R) — это кросс-вариантная проверка эквивалентности; byteSink различается
// легитимно (mono сериализует null-поля, guard — нет).
let semanticSink = 0;
let byteSink = 0;

function consumerStats(users) {
  let credits = 0, pro = 0, trial = 0;
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    credits += u.credits;
    if (u.plan === 'pro') pro++;
    if (u.trialUntil) trial++;
  }
  return credits + pro + trial;
}

function consumerFilter(users) {
  const active = [];
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    if (u.credits > 0 && u.referrer) active.push(u);
  }
  return active;
}

function computeScore(u) {
  let s = u.credits * 2;
  if (u.plan === 'pro') s += 100;
  if (u.referrer) s += 10;
  if (u.trialUntil) s += 5;
  if (u.teamId) s += 3;
  return s;
}

function consumerEnrich(users) {
  const derived = [];
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    // спред от u: derived наследует shape источника
    derived.push({ ...u, score: computeScore(u) });
  }
  return derived;
}

function consumerDerived(derived) {
  let s = 0;
  for (let i = 0; i < derived.length; i++) {
    const d = derived[i];
    s += d.score;
    if (d.plan === 'pro') s += 1;
    if (d.teamId) s += 1;
  }
  return s;
}

let cursor = 0;
const hr = () => process.hrtime.bigint();
const ms = (a, b) => Number(b - a) / 1e6;

function request() {
  const t = { parse: 0, normalize: 0, consume: 0, serialize: 0, total: 0 };
  const tStart = hr();

  // parse: JSON.parse построчно, смещение по кругу
  let t0 = hr();
  const raws = [];
  for (let k = 0; k < BATCH; k++) raws.push(JSON.parse(lines[(cursor + k) % N]));
  cursor = (cursor + BATCH) % N;
  t.parse = ms(t0, hr());

  // normalize
  t0 = hr();
  const users = [];
  for (let i = 0; i < raws.length; i++) users.push(normalizeUser(raws[i]));
  t.normalize = ms(t0, hr());

  // consume: R проходов × 4 консьюмера
  t0 = hr();
  let derived = null;
  for (let pass = 0; pass < R; pass++) {
    semanticSink += consumerStats(users);
    const active = consumerFilter(users);
    semanticSink += active.length;
    derived = consumerEnrich(users);
    semanticSink += consumerDerived(derived);
  }
  t.consume = ms(t0, hr());

  // serialize: топ-50 derived по score -> JSON.stringify ("ответ клиенту")
  t0 = hr();
  derived.sort((a, b) => b.score - a.score);
  const body = JSON.stringify(derived.slice(0, 50));
  byteSink += body.length;
  t.serialize = ms(t0, hr());

  t.total = ms(tStart, hr());
  return t;
}

for (let i = 0; i < WARMUP; i++) request();

const stages = { parse: [], normalize: [], consume: [], serialize: [], total: [] };
for (let i = 0; i < MEASURE; i++) {
  const t = request();
  for (const k of Object.keys(stages)) stages[k].push(t[k]);
}

const q = (arr, p) => {
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(s.length * p))];
};
const r3 = x => +x.toFixed(3);

console.log(JSON.stringify({
  variant: VARIANT, batch: BATCH, r: R, rep: REP,
  parse_ms: r3(q(stages.parse, 0.5)),
  normalize_ms: r3(q(stages.normalize, 0.5)),
  consume_ms: r3(q(stages.consume, 0.5)),
  serialize_ms: r3(q(stages.serialize, 0.5)),
  p50_total: r3(q(stages.total, 0.5)),
  p99_total: r3(q(stages.total, 0.99)),
  semanticSink, byteSink,
}));
