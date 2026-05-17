#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = __dirname;
const experimentName = process.argv[2] || process.env.EXPERIMENT || 'heap-preset';
const mode = process.env.MODE || 'local';
const profile = process.env.PROFILE || 'sync';
let repeats = Number(process.env.REPEATS || 5);
if (!Number.isFinite(repeats) || repeats < 1) repeats = 5;
const timestamp = process.env.RUN_ID || new Date().toISOString().replace(/[:.]/g, '-');
const memoryLimit = process.env.MEMORY_LIMIT || '512m';
const image = process.env.DOCKER_IMAGE || 'v8-flags-lab:local';

const WORKLOAD_ENV_KEYS = [
  'ITERATIONS',
  'STEADY_ITERATIONS',
  'WARMUP_ITERATIONS',
  'PAYLOAD_SIZE',
  'WORKLOAD',
  'RETAIN_EVERY',
  'RETAIN_LIMIT',
  'RETAIN_OBJECTS',
  'IDLE_S',
  'YIELD_EVERY',
  'SPIKE_ITERATIONS',
];

const commonEnv = {
  PRESSURE_PROFILE: process.env.PRESSURE_PROFILE || 'mixed',
};
for (const key of WORKLOAD_ENV_KEYS) {
  if (process.env[key] !== undefined && process.env[key] !== '') {
    commonEnv[key] = process.env[key];
  }
}

const experiments = {
  'heap-preset': {
    type: 'preset',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      {
        label: 'old384-semi64',
        flags: ['--max-old-space-size=384', '--max-semi-space-size=64'],
        changed: ['max-old-space-size', 'max-semi-space-size'],
      },
    ],
  },
  'max-old-space-size': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'old256', flags: ['--max-old-space-size=256'], changed: ['max-old-space-size'] },
      { label: 'old384', flags: ['--max-old-space-size=384'], changed: ['max-old-space-size'] },
    ],
  },
  'max-semi-space-size': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'semi2', flags: ['--max-semi-space-size=2'], changed: ['max-semi-space-size'] },
      { label: 'semi64', flags: ['--max-semi-space-size=64'], changed: ['max-semi-space-size'] },
    ],
  },
  'initial-old-space-size': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'initial-old128', flags: ['--initial-old-space-size=128'], changed: ['initial-old-space-size'] },
      { label: 'initial-old384', flags: ['--initial-old-space-size=384'], changed: ['initial-old-space-size'] },
    ],
  },
  'lazy-new-space-shrinking': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'lazy-new-space-shrinking', flags: ['--lazy-new-space-shrinking'], changed: ['lazy-new-space-shrinking'] },
    ],
  },
  'semi-space-growth-factor': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'growth1', flags: ['--semi-space-growth-factor=1'], changed: ['semi-space-growth-factor'] },
      { label: 'growth4', flags: ['--semi-space-growth-factor=4'], changed: ['semi-space-growth-factor'] },
      { label: 'growth8', flags: ['--semi-space-growth-factor=8'], changed: ['semi-space-growth-factor'] },
      { label: 'growth16', flags: ['--semi-space-growth-factor=16'], changed: ['semi-space-growth-factor'] },
    ],
  },
  'lite-mode': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'lite-mode', flags: ['--lite-mode'], changed: ['lite-mode'] },
    ],
  },
  'stress-concurrent-allocation': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      {
        label: 'stress-concurrent-alloc',
        flags: ['--stress-concurrent-allocation'],
        changed: ['stress-concurrent-allocation'],
      },
    ],
  },
  'scavenger-max-new-space-capacity-mb': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      {
        label: 'scavenger-new4',
        flags: ['--scavenger-max-new-space-capacity-mb=4'],
        changed: ['scavenger-max-new-space-capacity-mb'],
      },
      {
        label: 'scavenger-new8',
        flags: ['--scavenger-max-new-space-capacity-mb=8'],
        changed: ['scavenger-max-new-space-capacity-mb'],
      },
      {
        label: 'scavenger-new16',
        flags: ['--scavenger-max-new-space-capacity-mb=16'],
        changed: ['scavenger-max-new-space-capacity-mb'],
      },
      {
        label: 'scavenger-new32',
        flags: ['--scavenger-max-new-space-capacity-mb=32'],
        changed: ['scavenger-max-new-space-capacity-mb'],
      },
    ],
  },
  'memory-reducer': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'no-memory-reducer', flags: ['--no-memory-reducer'], changed: ['memory-reducer'] },
    ],
  },
  'memory-reducer-small-heaps': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      {
        label: 'no-memory-reducer-small-heaps',
        flags: ['--no-memory-reducer-for-small-heaps'],
        changed: ['memory-reducer-for-small-heaps'],
      },
    ],
  },
  'memory-balancer': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'memory-balancer', flags: ['--memory-balancer'], changed: ['memory-balancer'] },
    ],
  },
  'memory-balancer-c-value': {
    type: 'single-factor',
    profile: 'sync',
    baseFlags: ['--memory-balancer'],
    variants: [
      { label: 'balancer-default-c', flags: [], changed: [] },
      { label: 'balancer-c-1e-10', flags: ['--memory-balancer-c-value=1e-10'], changed: ['memory-balancer-c-value'] },
      { label: 'balancer-c-1e-9', flags: ['--memory-balancer-c-value=1e-9'], changed: ['memory-balancer-c-value'] },
    ],
  },
  'predictable-gc-schedule': {
    type: 'single-factor',
    profile: 'sync',
    variants: [
      { label: 'default', flags: [], changed: [] },
      { label: 'predictable-gc-schedule', flags: ['--predictable-gc-schedule'], changed: ['predictable-gc-schedule'] },
    ],
  },
  'trace-memory-balancer': {
    type: 'diagnostic',
    profile: 'sync',
    baseFlags: ['--memory-balancer'],
    variants: [
      { label: 'memory-balancer', flags: [], changed: [] },
      { label: 'trace-memory-balancer', flags: ['--trace-memory-balancer'], changed: ['trace-memory-balancer'] },
    ],
  },
};

const experiment = experiments[experimentName];

if (!experiment) {
  console.error(`Unknown experiment: ${experimentName}`);
  console.error(`Available: ${Object.keys(experiments).sort().join(', ')}`);
  process.exit(1);
}

if (profile !== experiment.profile) {
  console.error(`Experiment ${experimentName} supports PROFILE=${experiment.profile}, got ${profile}`);
  process.exit(1);
}

for (const variant of experiment.variants) {
  const changed = new Set(variant.changed || []);
  if (experiment.type === 'single-factor' && changed.size > 1) {
    console.error(`Variant ${variant.label} changes more than one parameter: ${[...changed].join(', ')}`);
    process.exit(1);
  }
}

function rel(...parts) {
  return path.join('results', timestamp, experimentName, ...parts);
}

function writeJson(file, data) {
  const full = path.join(root, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(data, null, 2));
}

function runCommand(command, args, env) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: 'inherit',
  });
  return {
    status: result.status,
    signal: result.signal,
    error: result.error ? result.error.message : null,
  };
}

function buildDockerImage() {
  if (mode !== 'docker') return null;
  if (process.env.DOCKER_BUILD === '0') return null;
  return runCommand('docker', ['build', '-t', image, '.'], {});
}

function runOne(variant, runIndex) {
  const runId = String(runIndex + 1).padStart(3, '0');
  const out = rel(variant.label, `run-${runId}.json`);
  const label = `${variant.label}`;
  const env = { ...commonEnv, LABEL: label, OUT: out };
  const flags = [...(experiment.baseFlags || []), ...variant.flags];
  const script = profile === 'sync' ? 'sync-data-bench.js' : 'async-http-server.js';

  if (mode === 'local') {
    return runCommand(process.execPath, [...flags, script], env);
  }

  if (mode === 'docker') {
    return runCommand(
      'docker',
      [
        'run',
        '--rm',
        '--memory',
        memoryLimit,
        '--memory-swap',
        memoryLimit,
        '-v',
        `${root}:/lab`,
        '-w',
        '/lab',
        image,
        'node',
        ...flags,
        script,
      ],
      env
    );
  }

  console.error(`Unknown MODE=${mode}`);
  process.exit(1);
}

const dockerBuild = buildDockerImage();
if (dockerBuild && dockerBuild.status !== 0) {
  console.error('Docker build failed');
  process.exit(dockerBuild.status || 1);
}

for (const variant of experiment.variants) {
  const manifest = {
    experiment: experimentName,
    experimentType: experiment.type,
    mode,
    profile,
    variant: variant.label,
    changedParameters: variant.changed || [],
    flags: [...(experiment.baseFlags || []), ...variant.flags],
    commonEnv,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    dockerImage: mode === 'docker' ? image : null,
    memoryLimit: mode === 'docker' ? memoryLimit : null,
    repeats,
    runs: [],
  };

  for (let i = 0; i < repeats; i++) {
    console.log(`\n[${experimentName}] ${variant.label} run ${i + 1}/${repeats}`);
    const status = runOne(variant, i);
    manifest.runs.push({ run: i + 1, ...status });
  }

  writeJson(rel(variant.label, 'manifest.json'), manifest);
}

console.log(`\nResults: ${path.join('results', timestamp, experimentName)}`);
console.log(`Compare: node compare-runs.js ${path.join('results', timestamp, experimentName)}`);
