const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const test = require('node:test');

const root = path.join(__dirname, '..');

function runNode(args, env = {}) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
}

test('sync-data-bench writes phase summaries for long-lived runs', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v8-phase-'));
  const out = path.join(dir, 'run.json');
  const result = runNode(['sync-data-bench.js'], {
    OUT: out,
    LABEL: 'phase-test',
    PRESSURE_PROFILE: 'new-space-pressure',
    WARMUP_ITERATIONS: '5',
    SPIKE_ITERATIONS: '6',
    STEADY_ITERATIONS: '10',
    ITERATIONS: '10',
    IDLE_S: '0.05',
    YIELD_EVERY: '2',
    PAYLOAD_SIZE: '5000',
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const data = JSON.parse(fs.readFileSync(out, 'utf8'));
  assert.deepEqual(
    data.phaseSummaries.map((p) => p.name),
    ['warmup', 'spike', 'steady', 'idle']
  );
  const steady = data.phaseSummaries.find((p) => p.name === 'steady');
  assert.equal(steady.latency.count, 10);
  assert.ok(Number.isFinite(steady.memory.rssMax));
  assert.ok(Number.isFinite(steady.gc.minorCount));
});

test('compare-runs prints phase summaries when result JSON contains phases', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v8-compare-phase-'));
  const labelDir = path.join(dir, 'default');
  fs.mkdirSync(labelDir, { recursive: true });
  const out = path.join(labelDir, 'run-001.json');
  const run = runNode(['sync-data-bench.js'], {
    OUT: out,
    LABEL: 'default',
    PRESSURE_PROFILE: 'new-space-pressure',
    WARMUP_ITERATIONS: '3',
    SPIKE_ITERATIONS: '4',
    STEADY_ITERATIONS: '8',
    ITERATIONS: '8',
    IDLE_S: '0.05',
    YIELD_EVERY: '2',
    PAYLOAD_SIZE: '5000',
  });

  assert.equal(run.status, 0, run.stderr || run.stdout);
  const result = runNode(['compare-runs.js', dir]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /Phase summaries/);
  assert.match(result.stdout, /steady/);
  assert.match(result.stdout, /idle/);
});

function waitForOutput(child, pattern) {
  return new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${pattern}`)), 5000);
    function onData(chunk) {
      output += chunk.toString();
      if (pattern.test(output)) {
        clearTimeout(timer);
        resolve(output);
      }
    }
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
  });
}

function waitForExit(child) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      resolve(-1);
    }, 5000);
    child.on('exit', (code) => resolve(code));
    child.on('exit', () => clearTimeout(timer));
  });
}

test('async-http-server writes phase summaries under load', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'v8-async-phase-'));
  const out = path.join(dir, 'async.json');
  const port = String(39000 + Math.floor(Math.random() * 1000));
  const server = spawn(process.execPath, ['async-http-server.js'], {
    cwd: root,
    env: {
      ...process.env,
      OUT: out,
      LABEL: 'async-phase-test',
      PORT: port,
      WARMUP_S: '0.05',
      STEADY_S: '0.15',
      SPIKE_S: '0.15',
      IDLE_S: '0.1',
      DURATION_S: '0.5',
      RETAIN_CACHE: '1',
      CACHE_LIMIT: '50',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  try {
    await waitForOutput(server, /Server listening/);
    const load = runNode(['load-client.js'], {
      URL: `http://localhost:${port}/mixed`,
      DURATION_S: '0.35',
      CONCURRENCY: '4',
    });
    assert.equal(load.status, 0, load.stderr || load.stdout);
    assert.equal(await waitForExit(server), 0);
    const data = JSON.parse(fs.readFileSync(out, 'utf8'));
    assert.deepEqual(
      data.phaseSummaries.map((p) => p.name),
      ['warmup', 'steady', 'spike', 'idle']
    );
    assert.ok(data.metadata.requestCounts.mixed > 0);
    assert.ok(data.phaseSummaries.some((p) => p.latency && p.latency.count > 0));
  } finally {
    if (!server.killed) server.kill('SIGTERM');
  }
});
