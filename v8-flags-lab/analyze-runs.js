#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { decide, TH } = require('./lib/evidence-model');
const {
  walk,
  loadRuns,
  groupByLabel,
  bootstrapMedianDiff,
  consistencyScore,
} = require('./lib/run-metrics');

const dir = process.argv[2];
const jsonOut = process.argv.includes('--json');
const bootstrapIterations = Number(process.env.ANALYZE_BOOTSTRAP_B || '2000');

if (!dir) {
  console.error('Usage: node analyze-runs.js <results-dir> [--json]');
  process.exit(1);
}

const METRIC_KEYS = [
  'rssMax',
  'rssFinal',
  'heapTotalMax',
  'heapTotalFinal',
  'heapMax',
  'externalMax',
  'arrayBuffersMax',
  'minorGc',
  'majorGc',
  'gcRatio',
  'latencyP95',
  'newSpaceUsedMax',
  'oldSpaceUsedMax',
  'steadyRssMax',
  'steadyMinorGc',
  'steadyMajorGc',
  'steadyGcRatio',
  'steadyLatencyP95',
  'idleRssFinal',
  'idleRssMax',
  'idleHeapTotalFinal',
];

const LOWER_BETTER = new Set(METRIC_KEYS);

function readPressureProfile(rootDir) {
  const list = walk(rootDir).filter((f) => f.endsWith('.json') && !f.endsWith('manifest.json'));
  for (const f of list) {
    try {
      const raw = JSON.parse(fs.readFileSync(f, 'utf8'));
      const p = raw.metadata?.pressureProfile;
      if (p) return p;
    } catch {
      continue;
    }
  }
  return null;
}

function collectByLabel(rootDir) {
  const runs = loadRuns(rootDir);
  const map = groupByLabel(runs);
  const out = new Map();
  for (const [label, rows] of map) {
    const obj = { label, rows };
    for (const k of METRIC_KEYS) {
      obj[k] = rows.map((r) => r[k]).filter(Number.isFinite);
    }
    out.set(label, obj);
  }
  return out;
}

function buildBoots(baseVals, varVals, iterations) {
  const random = Math.random;
  const boots = {};
  for (const k of METRIC_KEYS) {
    const bv = baseVals[k] || [];
    const vv = varVals[k] || [];
    const boot = bootstrapMedianDiff(bv, vv, iterations, random);
    const lowerBetter = LOWER_BETTER.has(k);
    boots[k] = {
      medianDiff: boot.medianDiff,
      ciLow: boot.ciLow,
      ciHigh: boot.ciHigh,
      consistency: consistencyScore(bv, vv, lowerBetter),
    };
  }
  return boots;
}

function main() {
  const abs = path.isAbsolute(dir) ? dir : path.join(process.cwd(), dir);
  const experimentName = path.basename(abs);
  const pressureProfile = readPressureProfile(abs);
  const byLabel = collectByLabel(abs);
  const summaries = [...byLabel.keys()].sort();
  if (!summaries.length) {
    console.error('No runs found.');
    process.exit(1);
  }

  const baselineLabel =
    summaries.includes('default') ? 'default' : summaries.includes('balancer-default-c') ? 'balancer-default-c' : summaries[0];

  const baseline = byLabel.get(baselineLabel);
  if (!baseline) {
    console.error('No baseline group.');
    process.exit(1);
  }

  const report = {
    experimentName,
    pressureProfile,
    baseline: baselineLabel,
    bootstrapIterations,
    thresholds: TH,
    variants: [],
  };

  for (const label of summaries) {
    if (label === baselineLabel) continue;
    const variant = byLabel.get(label);
    const boots = buildBoots(baseline, variant, bootstrapIterations);
    const d = decide({
      experimentName,
      pressureProfile,
      variantLabel: label,
      boots,
      baselineN: baseline.rows.length,
      variantN: variant.rows.length,
    });
    report.variants.push({ label, boots, decision: d });
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`Experiment: ${experimentName}`);
  console.log(`Pressure profile (from JSON): ${pressureProfile || 'unknown'}`);
  console.log(`Baseline: ${baselineLabel}  n=${baseline.rows.length}`);
  console.log(`Bootstrap median-diff iterations: ${bootstrapIterations}`);
  console.log('');

  for (const v of report.variants) {
    console.log(`--- ${v.label}  n=${byLabel.get(v.label).rows.length}`);
    console.log(
      `  decision: ${v.decision.decision}  (${v.decision.reason})`
    );
    const keys = ['rssMax', 'steadyMinorGc', 'majorGc', 'gcRatio', 'idleRssFinal', 'idleHeapTotalFinal', 'externalMax'];
    for (const k of keys) {
      const b = v.boots[k];
      if (!b || !Number.isFinite(b.medianDiff)) continue;
      console.log(
        `  ${k}: Δmedian=${b.medianDiff.toFixed(4)}  CI[${b.ciLow.toFixed(4)}, ${b.ciHigh.toFixed(4)}]  consistency=${b.consistency.toFixed(2)}`
      );
    }
    console.log('');
  }
}

main();
