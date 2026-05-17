const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');

const root = path.join(__dirname, '..');

function runNode(args, env = {}) {
  return spawnSync(process.execPath, args, {
    cwd: root,
    env: { ...process.env, ...env, ANALYZE_BOOTSTRAP_B: '500' },
    encoding: 'utf8',
  });
}

function phase(name, rssMax, rssFinal, heapTotMax, heapTotFin, minC, majC, gcr, latP95) {
  return {
    name,
    memory: { rssMax, rssFinal, heapTotalMax: heapTotFin, heapTotalFinal: heapTotFin },
    gc: { minorCount: minC, majorCount: majC, gcRatio: gcr },
    latency: { p95: latP95 },
  };
}

function runJson(label, steadyMin, rssMax, rssFin = rssMax) {
  return {
    label,
    nodeVersion: process.version,
    totalMs: 1e6,
    flags: [],
    metadata: { pressureProfile: 'new-space-pressure' },
    memory: {
      rssMin: rssMax * 0.9,
      rssMax,
      rssFinal: rssFin,
      rssFinalOverMax: rssFin / rssMax,
      heapMin: 1,
      heapMax: 2e6,
      heapFinal: 1e6,
      heapTotalMax: 20e6,
      heapTotalFinal: 20e6,
      heapTotalFinalOverMax: 1,
      externalMax: 0,
      externalFinal: 0,
      arrayBuffersMax: 0,
      arrayBuffersFinal: 0,
      rssOtherApproxMax: 0,
      rssOtherApproxFinal: 0,
    },
    heapSpaces: {
      new_space: { usedMax: 2e6, sizeMax: 4e6, availableMin: 0, usedFinal: 1e6, sizeFinal: 4e6 },
      old_space: { usedMax: 8e6, sizeMax: 16e6, availableMin: 0, usedFinal: 8e6, sizeFinal: 16e6 },
    },
    phaseSummaries: [
      phase('warmup', rssMax * 0.95, rssMax * 0.95, 20e6, 20e6, 10, 0, 0.001, 1),
      phase('spike', rssMax, rssMax, 22e6, 22e6, 20, 0, 0.002, 1),
      phase('steady', rssMax, rssMax, 22e6, 22e6, steadyMin, 1, 0.005, 2),
      phase('idle', rssFin, rssFin, 20e6, 20e6, 0, 0, 0, 0),
    ],
    gc: {
      totalCount: steadyMin + 5,
      totalMs: 1000,
      gcRatio: 0.01,
      minorCount: steadyMin + 50,
      majorCount: 2,
      byKind: {},
    },
    latency: { count: 10, p95: 2, p50: 1, p99: 3, avg: 1, max: 4 },
  };
}

test('analyze-runs emits decision json for new-space tradeoff', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'v8-analyze-'));
  const expDir = path.join(base, 'semi-space-growth-factor');
  const defDir = path.join(expDir, 'default');
  const g4Dir = path.join(expDir, 'growth4');
  fs.mkdirSync(defDir, { recursive: true });
  fs.mkdirSync(g4Dir, { recursive: true });
  for (let i = 0; i < 5; i++) {
    fs.writeFileSync(path.join(defDir, `run-${String(i + 1).padStart(3, '0')}.json`), JSON.stringify(runJson('default', 200, 80e6)));
    fs.writeFileSync(path.join(g4Dir, `run-${String(i + 1).padStart(3, '0')}.json`), JSON.stringify(runJson('growth4', 80, 100e6)));
  }
  const r = runNode(['analyze-runs.js', expDir, '--json']);
  assert.equal(r.status, 0, r.stderr);
  const data = JSON.parse(r.stdout);
  assert.equal(data.baseline, 'default');
  const g4 = data.variants.find((v) => v.label === 'growth4');
  assert.ok(g4);
  assert.ok(['conditional', 'recommended', 'not_recommended', 'no_visible_effect', 'inconclusive'].includes(g4.decision.decision));
  assert.equal(g4.decision.decision, 'conditional');
});

test('analyze-runs detects external-pressure class via metadata', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'v8-analyze-ext-'));
  const expDir = path.join(base, 'heap-preset');
  const aDir = path.join(expDir, 'default');
  const bDir = path.join(expDir, 'old384-semi64');
  fs.mkdirSync(aDir, { recursive: true });
  fs.mkdirSync(bDir, { recursive: true });
  const mk = (label, ext, rss) => {
    const j = runJson(label, 50, rss);
    j.metadata.pressureProfile = 'external-pressure';
    j.memory.externalMax = ext;
    j.memory.arrayBuffersMax = ext * 0.5;
    return j;
  };
  for (let i = 0; i < 5; i++) {
    fs.writeFileSync(path.join(aDir, `run-${String(i + 1).padStart(3, '0')}.json`), JSON.stringify(mk('default', 10e6, 90e6)));
    fs.writeFileSync(path.join(bDir, `run-${String(i + 1).padStart(3, '0')}.json`), JSON.stringify(mk('old384-semi64', 6e6, 110e6)));
  }
  const r = runNode(['analyze-runs.js', expDir, '--json']);
  assert.equal(r.status, 0, r.stderr);
  const data = JSON.parse(r.stdout);
  assert.equal(data.pressureProfile, 'external-pressure');
});
