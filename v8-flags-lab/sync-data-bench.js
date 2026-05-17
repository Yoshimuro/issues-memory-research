'use strict';

const metrics = require('./lib/metrics');

const PRESETS = {
  mixed: {
    ITERATIONS: '2000',
    WARMUP_ITERATIONS: '200',
    PAYLOAD_SIZE: '50000',
    WORKLOAD: 'mixed',
    RETAIN_EVERY: '50',
    RETAIN_LIMIT: '300',
    RETAIN_OBJECTS: '2',
    IDLE_S: '5',
    YIELD_EVERY: '25',
  },
  'new-space-pressure': {
    WORKLOAD: 'json',
    RETAIN_EVERY: '0',
    YIELD_EVERY: '5',
    ITERATIONS: '3500',
    WARMUP_ITERATIONS: '250',
    IDLE_S: '5',
    PAYLOAD_SIZE: '50000',
  },
  'old-space-pressure': {
    WORKLOAD: 'mixed',
    RETAIN_EVERY: '4',
    RETAIN_LIMIT: '12000',
    RETAIN_OBJECTS: '30',
    ITERATIONS: '2200',
    WARMUP_ITERATIONS: '200',
    IDLE_S: '4',
    YIELD_EVERY: '20',
    PAYLOAD_SIZE: '50000',
  },
  'external-pressure': {
    WORKLOAD: 'buffer',
    RETAIN_EVERY: '6',
    RETAIN_LIMIT: '1200',
    RETAIN_OBJECTS: '1',
    ITERATIONS: '2500',
    WARMUP_ITERATIONS: '150',
    IDLE_S: '4',
    YIELD_EVERY: '15',
    PAYLOAD_SIZE: '40000',
  },
  'idle-recovery': {
    WORKLOAD: 'mixed',
    RETAIN_EVERY: '35',
    RETAIN_LIMIT: '800',
    RETAIN_OBJECTS: '4',
    ITERATIONS: '1800',
    WARMUP_ITERATIONS: '150',
    IDLE_S: '18',
    YIELD_EVERY: '22',
    PAYLOAD_SIZE: '50000',
    SPIKE_ITERATIONS: '900',
  },
};

function envStr(key, preset, fallback) {
  const p = preset[key];
  if (process.env[key] !== undefined && process.env[key] !== '') return process.env[key];
  if (p !== undefined) return String(p);
  return fallback;
}

function envNum(key, preset, fallback) {
  const v = envStr(key, preset, null);
  if (v === null || v === '') return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

const PRESSURE_PROFILE = process.env.PRESSURE_PROFILE || 'mixed';
const preset = PRESETS[PRESSURE_PROFILE] || {};

const ITERATIONS = envNum('ITERATIONS', preset, 1000);
const WARMUP_ITERATIONS = envNum('WARMUP_ITERATIONS', preset, 0);
const STEADY_ITERATIONS = envNum('STEADY_ITERATIONS', preset, ITERATIONS);
const PAYLOAD_SIZE = envNum('PAYLOAD_SIZE', preset, 50_000);
const YIELD_EVERY = envNum('YIELD_EVERY', preset, 50);
const WORKLOAD = envStr('WORKLOAD', preset, 'mixed');
let RETAIN_EVERY = envNum('RETAIN_EVERY', preset, 100);
const RETAIN_LIMIT = envNum('RETAIN_LIMIT', preset, 100);
const RETAIN_OBJECTS = envNum('RETAIN_OBJECTS', preset, 1);
const IDLE_S = envNum('IDLE_S', preset, 0);
const SPIKE_ITERATIONS = envNum('SPIKE_ITERATIONS', preset, 0);
const OUT = process.env.OUT || null;
const LABEL = process.env.LABEL || `sync-data-${ITERATIONS}x${PAYLOAD_SIZE}`;

let retainEveryActive = RETAIN_EVERY;
let retainLimitActive = RETAIN_LIMIT;

function makePayload(targetSize) {
  const items = [];
  let size = 2;
  let i = 0;
  while (size < targetSize) {
    const item = {
      id: i,
      uuid: `xxxxxxxx-xxxx-4xxx-yxxx-${String(i).padStart(12, '0')}`,
      name: `Item ${i} — ${'x'.repeat(20)}`,
      tags: ['alpha', 'beta', 'gamma', 'delta'].slice(0, (i % 4) + 1),
      meta: {
        createdAt: new Date(2020, 0, 1, 0, 0, i).toISOString(),
        score: Math.random(),
        active: i % 2 === 0,
      },
      payload: 'a'.repeat(50 + (i % 100)),
    };
    items.push(item);
    size = JSON.stringify(items).length;
    i += 1;
  }
  return JSON.stringify(items);
}

const payload = makePayload(PAYLOAD_SIZE);
const realSize = Buffer.byteLength(payload, 'utf8');
const retained = [];
const retainedBuffers = [];

console.log(`\nWorkload: data-intensive, semi-sync (yield every ${YIELD_EVERY || 'never'})`);
console.log(`Pressure profile: ${PRESSURE_PROFILE}`);
console.log(`Iterations:    ${ITERATIONS}`);
console.log(`Steady:        ${STEADY_ITERATIONS}`);
console.log(`Warmup:        ${WARMUP_ITERATIONS}`);
console.log(`Spike (pre):   ${SPIKE_ITERATIONS || 0}`);
console.log(`Profile:       ${WORKLOAD}`);
console.log(`Payload size:  ${realSize.toLocaleString()} bytes (~${(realSize / 1024).toFixed(1)} KB)`);
console.log(`Total bytes:   ~${((realSize * ITERATIONS) / 1024 / 1024).toFixed(1)} MB to parse`);

function shouldRun(part) {
  return WORKLOAD === 'mixed' || WORKLOAD === part;
}

let checksum = 0;
let lastBuffer = null;

function runUnit(i, measured, timer) {
  const stop = measured && timer ? timer() : null;
  const parsed = shouldRun('json') || shouldRun('string') ? JSON.parse(payload) : null;
  if (parsed) checksum = (checksum + parsed.length) | 0;

  if (parsed && shouldRun('string')) {
    let str = '';
    for (const item of parsed) {
      str += `${item.id}:${item.name};`;
    }
    checksum = (checksum + str.length) | 0;
    if (shouldRun('buffer')) {
      const buf = Buffer.from(str, 'utf8');
      if (lastBuffer) {
        const combined = Buffer.concat([lastBuffer, buf]);
        checksum = (checksum + combined.length) | 0;
      }
      lastBuffer = buf;
    }
  } else if (shouldRun('buffer')) {
    const buf = Buffer.alloc(Math.max(1024, Math.floor(realSize / 2)), i & 0xff);
    if (lastBuffer) {
      const combined = Buffer.concat([lastBuffer, buf]);
      checksum = (checksum + combined.length) | 0;
    }
    lastBuffer = buf;
  }

  if (parsed && retainEveryActive > 0 && i % retainEveryActive === 0) {
    for (let j = 0; j < RETAIN_OBJECTS && j < parsed.length; j++) {
      retained.push(parsed[j]);
      checksum = (checksum + parsed[j].id) | 0;
    }
    if (retained.length > retainLimitActive) {
      retained.splice(0, Math.ceil(retained.length / 2));
    }
  }

  if (shouldRun('buffer') && retainEveryActive > 0 && i % retainEveryActive === 0 && lastBuffer) {
    retainedBuffers.push(lastBuffer);
    if (retainedBuffers.length > retainLimitActive) {
      retainedBuffers.splice(0, Math.ceil(retainedBuffers.length / 2));
    }
  }

  if (stop) stop();
}

async function runLoop(iterations, measured, timer) {
  for (let i = 0; i < iterations; i++) {
    runUnit(i, measured, timer);
    if (YIELD_EVERY > 0 && i % YIELD_EVERY === 0 && i > 0) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  }
}

async function runSpikePhase() {
  if (!SPIKE_ITERATIONS) return;
  retainEveryActive = 1;
  retainLimitActive = Math.floor(RETAIN_LIMIT * 2);
  await runLoop(SPIKE_ITERATIONS, true, null);
  retainEveryActive = RETAIN_EVERY;
  retainLimitActive = RETAIN_LIMIT;
}

async function run() {
  const m = metrics.create({
    label: LABEL,
    outFile: OUT,
    sampleIntervalMs: 50,
    metadata: () => ({
      pressureProfile: PRESSURE_PROFILE,
      workload: WORKLOAD,
      iterations: ITERATIONS,
      steadyIterations: STEADY_ITERATIONS,
      warmupIterations: WARMUP_ITERATIONS,
      spikeIterations: SPIKE_ITERATIONS,
      payloadSize: realSize,
      retainEvery: RETAIN_EVERY,
      retainLimit: RETAIN_LIMIT,
      retainObjects: RETAIN_OBJECTS,
      idleSeconds: IDLE_S,
      retainedItems: retained.length,
      retainedBuffers: retainedBuffers.length,
    }),
  });

  m.start();
  m.markPhase('warmup');
  if (WARMUP_ITERATIONS > 0) {
    await runLoop(WARMUP_ITERATIONS, false, null);
  }

  m.markPhase('spike');
  await runSpikePhase();

  m.markPhase('steady');
  await runLoop(STEADY_ITERATIONS, true, () => m.timer());

  m.markPhase('idle');
  if (IDLE_S > 0) {
    await new Promise((resolve) => setTimeout(resolve, IDLE_S * 1000));
    if (global.gc) {
      global.gc();
      await new Promise((resolve) => setImmediate(resolve));
    }
  }

  m.stop();

  console.log(`\nChecksum: ${checksum} (sanity: not optimized away)`);
  console.log(`Retained items: ${retained.length}`);
  console.log(`Retained buffers: ${retainedBuffers.length}`);
  m.printSummary();
  m.saveJson();
}

run().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
