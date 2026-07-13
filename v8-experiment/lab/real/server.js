'use strict';
// Стретч: HTTP-сервер вокруг pipeline-логики. VARIANT через env, R=5 захардкожен.
// GET /process?batch=1000 -> прогоняет parse/normalize/consume/serialize, отвечает топ-50.
const http = require('http');
const fs = require('fs');
const path = require('path');

const VARIANT = process.env.VARIANT;
const PORT = +(process.env.PORT || 3000);
const R = 5;

const { normalizeUser } = require(path.join(__dirname, 'variants', VARIANT + '.js'));
const lines = fs.readFileSync(path.join(__dirname, 'dataset.ndjson'), 'utf8')
  .split('\n').filter(Boolean);
const N = lines.length;

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
let sink = 0;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname !== '/process') { res.writeHead(404); res.end(); return; }
  const BATCH = +(url.searchParams.get('batch') || 1000);

  const raws = [];
  for (let k = 0; k < BATCH; k++) raws.push(JSON.parse(lines[(cursor + k) % N]));
  cursor = (cursor + BATCH) % N;

  const users = [];
  for (let i = 0; i < raws.length; i++) users.push(normalizeUser(raws[i]));

  let derived = null;
  for (let pass = 0; pass < R; pass++) {
    sink += consumerStats(users);
    sink += consumerFilter(users).length;
    derived = consumerEnrich(users);
    sink += consumerDerived(derived);
  }

  derived.sort((a, b) => b.score - a.score);
  const body = JSON.stringify(derived.slice(0, 50));
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(body);
});

server.listen(PORT, () => console.log(`ready ${VARIANT} :${PORT}`));
