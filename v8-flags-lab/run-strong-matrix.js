#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const os = require('node:os');
const readline = require('node:readline');
const { STRONG_MATRIX, STRONG_SYNC_ENV } = require('./lib/evidence-model');

const root = __dirname;
const matrixId = process.env.MATRIX_RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const skipAnalyze = process.env.MATRIX_SKIP_ANALYZE === '1';

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : fallback;
}

const concurrency = parsePositiveInt(process.env.MATRIX_CONCURRENCY, 4);
const repeatsOverride = process.env.MATRIX_REPEATS
  ? parsePositiveInt(process.env.MATRIX_REPEATS, null)
  : null;

const filterTokens = (process.env.MATRIX_FILTER || '')
  .split(',')
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);

function cellMatchesFilter(cell) {
  if (!filterTokens.length) return true;
  const haystack = `${cell.experiment} ${cell.profile}`.toLowerCase();
  return filterTokens.some((token) => haystack.includes(token));
}

const cells = STRONG_MATRIX.filter(cellMatchesFilter);

if (!cells.length) {
  console.error(`No cells match MATRIX_FILTER="${process.env.MATRIX_FILTER}"`);
  process.exit(1);
}

function buildSchedule(list) {
  const groups = new Map();
  for (const cell of list) {
    if (!groups.has(cell.profile)) groups.set(cell.profile, []);
    groups.get(cell.profile).push(cell);
  }
  const queues = [...groups.values()];
  const ordered = [];
  while (queues.some((q) => q.length)) {
    for (const q of queues) {
      if (q.length) ordered.push(q.shift());
    }
  }
  return ordered;
}

const scheduled = buildSchedule(cells);

const manifest = {
  matrixId,
  nodeVersion: process.version,
  platform: process.platform,
  arch: process.arch,
  hostCpus: os.cpus().length,
  concurrency,
  filter: filterTokens.length ? filterTokens : null,
  repeatsOverride,
  strongEnv: { ...STRONG_SYNC_ENV },
  cells: [],
};

function buildCellEnv(cell) {
  const env = {
    ...STRONG_SYNC_ENV,
    ...process.env,
    PRESSURE_PROFILE: cell.profile,
  };
  if (cell.idleS != null) env.IDLE_S = String(cell.idleS);
  if (cell.repeats != null) env.REPEATS = String(cell.repeats);
  if (repeatsOverride != null) env.REPEATS = String(repeatsOverride);
  return env;
}

function streamWithPrefix(stream, prefix, sink) {
  const rl = readline.createInterface({ input: stream });
  rl.on('line', (line) => sink.write(`${prefix} ${line}\n`));
}

function runChild(label, command, args, env) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: root,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    streamWithPrefix(child.stdout, label, process.stdout);
    streamWithPrefix(child.stderr, label, process.stderr);
    child.on('close', (status, signal) => {
      resolve({ status: status ?? (signal ? 1 : 0), signal: signal || null });
    });
    child.on('error', (err) => {
      resolve({ status: 1, signal: null, error: err.message });
    });
  });
}

async function runCell(cell) {
  const subId = `${cell.experiment}__${cell.profile}`.replace(/[^a-zA-Z0-9._-]+/g, '_');
  const runId = `${matrixId}/${subId}`;
  const env = { ...buildCellEnv(cell), RUN_ID: runId };
  const label = `[${subId}]`;

  console.log(`\n${label} starting  RUN_ID=${runId}`);
  const r = await runChild(label, process.execPath, ['run-experiment.js', cell.experiment], env);

  const resultPath = path.join('results', runId, cell.experiment);
  const entry = {
    experiment: cell.experiment,
    profile: cell.profile,
    runId,
    resultPath,
    status: r.status,
  };
  if (r.signal) entry.signal = r.signal;
  if (r.error) entry.error = r.error;

  if (!skipAnalyze && r.status === 0) {
    const analyzed = await runAnalyze(label, path.join(root, resultPath));
    if (analyzed.parsed) entry.analysis = analyzed.parsed;
    else if (analyzed.raw != null) entry.analysisRaw = analyzed.raw;
    if (analyzed.error) entry.analyzeError = analyzed.error;
  }

  console.log(`${label} finished  status=${entry.status}`);
  return entry;
}

function runAnalyze(label, dir) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['analyze-runs.js', dir, '--json'], {
      cwd: root,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    streamWithPrefix(child.stderr, `${label} analyze`, process.stderr);
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (status) => {
      if (status === 0) {
        try {
          resolve({ parsed: JSON.parse(stdout) });
        } catch {
          resolve({ raw: stdout });
        }
        return;
      }
      resolve({ error: stderr || `analyze exit ${status}` });
    });
    child.on('error', (err) => resolve({ error: err.message }));
  });
}

async function runWithPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

(async () => {
  console.log(
    `[matrix] cells=${scheduled.length} concurrency=${concurrency}` +
      (repeatsOverride != null ? ` repeats=${repeatsOverride}` : '') +
      (filterTokens.length ? ` filter=${filterTokens.join(',')}` : '')
  );

  const entries = await runWithPool(scheduled, concurrency, runCell);
  manifest.cells.push(...entries);

  const manifestPath = path.join(root, 'results', matrixId, 'matrix-manifest.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\nMatrix manifest: ${path.relative(process.cwd(), manifestPath)}`);

  const failed = manifest.cells.filter((c) => c.status !== 0);
  if (failed.length) {
    console.error(`Matrix completed with ${failed.length} failing cell(s).`);
    process.exit(1);
  }
})();
