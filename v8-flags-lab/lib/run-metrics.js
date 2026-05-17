'use strict';

const fs = require('node:fs');
const path = require('node:path');

function walk(root) {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'manifest.json') out.push(full);
  }
  return out;
}

function median(vals) {
  const sorted = [...vals].filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  return sorted[Math.floor((sorted.length - 1) / 2)];
}

function groupByLabel(items) {
  const groups = new Map();
  for (const item of items) {
    const key = item.label || 'unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function phaseFind(data, name) {
  return data.phaseSummaries?.find((p) => p.name === name) || null;
}

function extractScalars(data) {
  const steady = phaseFind(data, 'steady');
  const idle = phaseFind(data, 'idle');
  const ns = data.heapSpaces?.new_space;
  const os = data.heapSpaces?.old_space;
  return {
    label: data.label,
    rssMax: data.memory?.rssMax,
    rssFinal: data.memory?.rssFinal,
    heapTotalMax: data.memory?.heapTotalMax,
    heapTotalFinal: data.memory?.heapTotalFinal,
    heapMax: data.memory?.heapMax,
    externalMax: data.memory?.externalMax,
    arrayBuffersMax: data.memory?.arrayBuffersMax,
    minorGc: data.gc?.minorCount,
    majorGc: data.gc?.majorCount,
    gcRatio: data.gc?.gcRatio,
    latencyP95: data.latency?.p95,
    newSpaceUsedMax: ns?.usedMax,
    oldSpaceUsedMax: os?.usedMax,
    steadyRssMax: steady?.memory?.rssMax,
    steadyMinorGc: steady?.gc?.minorCount,
    steadyMajorGc: steady?.gc?.majorCount,
    steadyGcRatio: steady?.gc?.gcRatio,
    steadyLatencyP95: steady?.latency?.p95,
    idleRssFinal: idle?.memory?.rssFinal,
    idleRssMax: idle?.memory?.rssMax,
    idleHeapTotalFinal: idle?.memory?.heapTotalFinal,
  };
}

function loadRuns(dir) {
  const files = walk(dir);
  const runs = [];
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (data.memory && data.gc) runs.push({ file: f, ...extractScalars(data) });
    } catch {
      continue;
    }
  }
  return runs;
}

function consistencyScore(baseVals, varVals, lowerIsBetter) {
  const mb = median(baseVals);
  if (!Number.isFinite(mb) || !varVals.length) return 0;
  let hit = 0;
  let tot = 0;
  for (const v of varVals) {
    if (!Number.isFinite(v)) continue;
    tot += 1;
    if (lowerIsBetter && v < mb) hit += 1;
    if (!lowerIsBetter && v > mb) hit += 1;
  }
  return tot ? hit / tot : 0;
}

function bootstrapMedianDiff(baseVals, varVals, iterations, random) {
  const bv = baseVals.filter(Number.isFinite);
  const vv = varVals.filter(Number.isFinite);
  if (!bv.length || !vv.length) {
    return { medianDiff: NaN, ciLow: NaN, ciHigh: NaN, distribution: [] };
  }
  const point = median(vv) - median(bv);
  const dist = [];
  for (let i = 0; i < iterations; i++) {
    const bs = [];
    for (let j = 0; j < bv.length; j++) bs.push(bv[Math.floor(random() * bv.length)]);
    const vs = [];
    for (let j = 0; j < vv.length; j++) vs.push(vv[Math.floor(random() * vv.length)]);
    dist.push(median(vs) - median(bs));
  }
  dist.sort((a, b) => a - b);
  const lo = dist[Math.max(0, Math.floor(0.025 * iterations))];
  const hi = dist[Math.min(dist.length - 1, Math.ceil(0.975 * iterations) - 1)];
  return { medianDiff: point, ciLow: lo, ciHigh: hi, distribution: dist };
}

module.exports = {
  walk,
  median,
  groupByLabel,
  extractScalars,
  loadRuns,
  consistencyScore,
  bootstrapMedianDiff,
};
