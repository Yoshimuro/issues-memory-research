'use strict';

const http = require('node:http');
const metrics = require('./lib/metrics');

const PORT = Number(process.env.PORT) || 3000;
const DURATION_S = Number(process.env.DURATION_S ?? 30);
const WARMUP_S = Number(process.env.WARMUP_S ?? 0);
const STEADY_S = Number(process.env.STEADY_S ?? DURATION_S);
const SPIKE_S = Number(process.env.SPIKE_S ?? 0);
const IDLE_S = Number(process.env.IDLE_S ?? 0);
const MIX_PATTERN = (process.env.MIX_PATTERN || 'small,small,small,large,buffer').split(',');
const RETAIN_CACHE = process.env.RETAIN_CACHE === '1';
const CACHE_LIMIT = Number(process.env.CACHE_LIMIT ?? 200);
const OUT = process.env.OUT || null;
const LABEL = process.env.LABEL || `async-http-port${PORT}`;

function makeBigPayload() {
  const items = [];
  for (let i = 0; i < 1000; i++) {
    items.push({
      id: i,
      name: `Item ${i}`,
      description: 'Lorem ipsum dolor sit amet, '.repeat(10),
      tags: ['a', 'b', 'c', 'd', 'e'].slice(0, (i % 5) + 1),
      meta: {
        createdAt: new Date(2020, 0, 1, 0, 0, i).toISOString(),
        score: i / 1000,
      },
    });
  }
  return JSON.stringify(items);
}

const BIG_JSON = makeBigPayload();
console.log(`Big payload prepared: ${(Buffer.byteLength(BIG_JSON) / 1024).toFixed(1)} KB`);

let m = null;
let measuring = false;
let mixIndex = 0;
const counts = { small: 0, large: 0, buffer: 0, mixed: 0, health: 0, notFound: 0 };
const retained = [];

function timer() {
  return measuring && m ? m.timer() : () => {};
}

function retain(value) {
  if (!RETAIN_CACHE) return;
  retained.push(value);
  if (retained.length > CACHE_LIMIT) retained.splice(0, Math.ceil(retained.length / 2));
}

function handleSmall(_req, res) {
  counts.small += 1;
  const stop = timer();
  const data = [];
  for (let i = 0; i < 100; i++) {
    data.push({ id: i, ts: Date.now(), val: Math.random() });
  }
  const json = JSON.stringify(data);
  retain(data[0]);
  stop();
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(json);
}

function handleLarge(_req, res) {
  counts.large += 1;
  const stop = timer();
  const parsed = JSON.parse(BIG_JSON);
  for (let i = 0; i < parsed.length; i++) {
    parsed[i].processed = true;
  }
  const json = JSON.stringify(parsed);
  retain(parsed[0]);
  stop();
  res.writeHead(200, { 'content-type': 'application/json' });
  res.end(json);
}

function handleBuffer(_req, res) {
  counts.buffer += 1;
  const stop = timer();
  const buffers = [];
  for (let i = 0; i < 10; i++) {
    const buf = Buffer.alloc(64 * 1024);
    buf.fill(i & 0xff);
    buffers.push(buf);
  }
  const merged = Buffer.concat(buffers);
  retain(merged);
  stop();
  res.writeHead(200, { 'content-type': 'application/octet-stream' });
  res.end(merged);
}

function handleMixed(req, res) {
  counts.mixed += 1;
  const endpoint = MIX_PATTERN[mixIndex % MIX_PATTERN.length];
  mixIndex += 1;
  if (endpoint === 'large') return handleLarge(req, res);
  if (endpoint === 'buffer') return handleBuffer(req, res);
  return handleSmall(req, res);
}

function handleHealth(_req, res) {
  counts.health += 1;
  res.writeHead(200, { 'content-type': 'text/plain' });
  res.end('ok');
}

const server = http.createServer((req, res) => {
  switch (req.url) {
    case '/small':
      return handleSmall(req, res);
    case '/large':
      return handleLarge(req, res);
    case '/buffer':
      return handleBuffer(req, res);
    case '/mixed':
      return handleMixed(req, res);
    case '/health':
      return handleHealth(req, res);
    default:
      counts.notFound += 1;
      res.writeHead(404);
      res.end('not found');
  }
});

server.keepAliveTimeout = 65_000;
server.headersTimeout = 66_000;

function startMeasurement() {
  if (measuring) return;
  measuring = true;
  m = metrics.create({
    label: LABEL,
    outFile: OUT,
    sampleIntervalMs: 100,
    metadata: () => ({
      warmupSeconds: WARMUP_S,
      steadySeconds: STEADY_S,
      spikeSeconds: SPIKE_S,
      idleSeconds: IDLE_S,
      durationSeconds: DURATION_S,
      mixPattern: MIX_PATTERN,
      retainCache: RETAIN_CACHE,
      cacheLimit: CACHE_LIMIT,
      retainedItems: retained.length,
      requestCounts: counts,
    }),
  });
  m.start();
  runPhases();
}

function schedule(seconds, fn) {
  const timerId = setTimeout(fn, Math.max(0, seconds) * 1000);
  if (timerId.unref) timerId.unref();
  return timerId;
}

function runPhases() {
  m.markPhase('warmup');
  schedule(WARMUP_S, () => {
    m.markPhase('steady');
    schedule(STEADY_S, () => {
      m.markPhase('spike');
      schedule(SPIKE_S, () => {
        m.markPhase('idle');
        schedule(IDLE_S, () => shutdown('phases'));
      });
    });
  });
}

server.listen(PORT, () => {
  console.log(`\nServer listening on http://localhost:${PORT}`);
  console.log(`Endpoints: /small  /large  /buffer  /mixed  /health`);
  console.log(`Node: ${process.version}`);
  console.log(`Flags: ${process.execArgv.join(' ') || '(defaults)'}`);
  console.log(`Phases: warmup ${WARMUP_S}s, steady ${STEADY_S}s, spike ${SPIKE_S}s, idle ${IDLE_S}s`);
  console.log(`Run load against http://localhost:${PORT}/mixed`);
  startMeasurement();
});

let shuttingDown = false;
function shutdown(reason) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\nShutting down (reason: ${reason}) ...`);
  server.close(() => {
    if (m) {
      m.stop();
      m.printSummary();
      m.saveJson();
    }
    console.log(`Request counts: ${JSON.stringify(counts)}`);
    console.log(`Retained items: ${retained.length}`);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
