#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node compare-runs.js <dir> [label1,label2,...]');
  process.exit(1);
}

const filter = process.argv[3] ? process.argv[3].split(',') : null;

function walk(root) {
  const out = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && entry.name.endsWith('.json') && entry.name !== 'manifest.json') out.push(full);
  }
  return out;
}

const runs = walk(dir)
  .map((f) => {
    try {
      return { file: f, data: JSON.parse(fs.readFileSync(f, 'utf8')) };
    } catch (e) {
      console.error(`Skipped ${f}: ${e.message}`);
      return null;
    }
  })
  .filter((r) => r !== null)
  .map((r) => ({ ...r.data, file: r.file }))
  .filter((r) => r.memory && r.gc)
  .filter((r) => !filter || filter.includes(r.label));

if (runs.length === 0) {
  console.error('No runs found.');
  process.exit(1);
}

function fmtMs(n) {
  if (!Number.isFinite(n)) return 'n/a';
  if (n < 1) return `${n.toFixed(3)}ms`;
  if (n < 1000) return `${n.toFixed(0)}ms`;
  return `${(n / 1000).toFixed(2)}s`;
}
function fmtMb(n) {
  if (!Number.isFinite(n)) return 'n/a';
  return `${(n / 1024 / 1024).toFixed(2)}MB`;
}
function fmtMbSigned(n) {
  if (!Number.isFinite(n)) return 'n/a';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n / 1024 / 1024).toFixed(2)}MB`;
}
function fmtPct(n) {
  if (!Number.isFinite(n)) return 'n/a';
  return `${(n * 100).toFixed(2)}%`;
}
function fmtPctSigned(n) {
  if (!Number.isFinite(n)) return 'n/a';
  const sign = n >= 0 ? '+' : '';
  return `${sign}${(n * 100).toFixed(2)}%`;
}
function median(vals) {
  if (!vals.length) return NaN;
  const sorted = [...vals].filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  return sorted[Math.floor((sorted.length - 1) / 2)];
}
function p95(vals) {
  if (!vals.length) return NaN;
  const sorted = [...vals].filter(Number.isFinite).sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.95) - 1)];
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

function spaceMedian(items, space, prop) {
  return median(items.map((r) => r.heapSpaces?.[space]?.[prop]).filter(Number.isFinite));
}

function phaseSummary(items, phaseName) {
  const phases = items.map((r) => r.phaseSummaries?.find((p) => p.name === phaseName)).filter(Boolean);
  if (!phases.length) return null;
  return {
    rssMax: median(phases.map((p) => p.memory?.rssMax)),
    rssFinal: median(phases.map((p) => p.memory?.rssFinal)),
    heapTotalMax: median(phases.map((p) => p.memory?.heapTotalMax)),
    minorGc: median(phases.map((p) => p.gc?.minorCount)),
    majorGc: median(phases.map((p) => p.gc?.majorCount)),
    gcRatio: median(phases.map((p) => p.gc?.gcRatio)),
    latencyP95: median(phases.map((p) => p.latency?.p95)),
  };
}

function summarize(label, items) {
  const nums = (get) => items.map(get).filter(Number.isFinite);
  const rssMax = nums((r) => r.memory.rssMax);
  const rssFinal = nums((r) => r.memory.rssFinal);
  const heapMax = nums((r) => r.memory.heapMax);
  const heapTotalMax = nums((r) => r.memory.heapTotalMax);
  const heapTotalFinal = nums((r) => r.memory.heapTotalFinal);
  const externalMax = nums((r) => r.memory.externalMax);
  const arrayBuffersMax = nums((r) => r.memory.arrayBuffersMax);
  const rssOtherMax = nums((r) => r.memory.rssOtherApproxMax);
  const gcRatio = nums((r) => r.gc.gcRatio);
  const majorGc = nums((r) => r.gc.majorCount);
  const minorGc = nums((r) => r.gc.minorCount);
  const latP95 = nums((r) => r.latency?.p95);
  const flagsFlat = items.flatMap((r) => r.flags || []);
  const diagnostic = flagsFlat.some((f) => typeof f === 'string' && f.includes('--trace'));
  const legacyNoSpaces = items.every((r) => !r.heapSpaces || Object.keys(r.heapSpaces).length === 0);
  const phaseNames = [...new Set(items.flatMap((r) => (r.phaseSummaries || []).map((p) => p.name)))];
  const phases = Object.fromEntries(phaseNames.map((name) => [name, phaseSummary(items, name)]));

  return {
    label,
    count: items.length,
    rssMaxMedian: median(rssMax),
    rssMaxP95: p95(rssMax),
    rssMaxMin: Math.min(...rssMax),
    rssMaxMax: Math.max(...rssMax),
    rssSpreadRatio: median(rssMax) > 0 ? (Math.max(...rssMax) - Math.min(...rssMax)) / median(rssMax) : 0,
    rssFinalMedian: median(rssFinal),
    rssFinalOverMaxMedian: median(nums((r) => r.memory.rssFinalOverMax)),
    heapMaxMedian: median(heapMax),
    heapTotalMaxMedian: median(heapTotalMax),
    heapTotalFinalMedian: median(heapTotalFinal),
    heapTotalFinalOverMaxMedian: median(nums((r) => r.memory.heapTotalFinalOverMax)),
    externalMaxMedian: median(externalMax),
    arrayBuffersMaxMedian: median(arrayBuffersMax),
    rssOtherApproxMaxMedian: median(rssOtherMax),
    gcRatioMedian: median(gcRatio),
    majorGcMedian: median(majorGc),
    minorGcMedian: median(minorGc),
    latencyP95Median: median(latP95),
    newSpaceUsedMaxMedian: spaceMedian(items, 'new_space', 'usedMax'),
    oldSpaceUsedMaxMedian: spaceMedian(items, 'old_space', 'usedMax'),
    loSpaceUsedMaxMedian: spaceMedian(items, 'large_object_space', 'usedMax'),
    diagnostic,
    legacyNoSpaces,
    phases,
  };
}

function verdict(base, row) {
  if (row.label === base.label) return 'baseline';
  const thr = 1 * 1024 * 1024;
  const parts = [];
  const drss = row.rssMaxMedian - base.rssMaxMedian;
  const dminor = row.minorGcMedian - base.minorGcMedian;
  const dmajor = row.majorGcMedian - base.majorGcMedian;
  const dheapTot = row.heapTotalMaxMedian - base.heapTotalMaxMedian;
  const drssFin = row.rssFinalMedian - base.rssFinalMedian;
  const dold = row.oldSpaceUsedMaxMedian - base.oldSpaceUsedMaxMedian;
  const dnew = row.newSpaceUsedMaxMedian - base.newSpaceUsedMaxMedian;
  const dp95 = row.latencyP95Median - base.latencyP95Median;

  if (Number.isFinite(drss) && Math.abs(drss) >= thr) {
    parts.push(drss < 0 ? 'lower RSS peak' : 'higher RSS peak');
  }
  if (Number.isFinite(drssFin) && Math.abs(drssFin) >= thr * 0.8) {
    parts.push(drssFin < 0 ? 'lower RSS after idle' : 'higher RSS after idle');
  }
  if (Number.isFinite(dheapTot) && Math.abs(dheapTot) >= thr * 0.5) {
    parts.push(dheapTot < 0 ? 'lower heapTotal peak' : 'higher heapTotal peak');
  }
  if (Number.isFinite(dminor) && Math.abs(dminor) >= 3) {
    parts.push(dminor < 0 ? 'fewer minor GC' : 'more minor GC');
  }
  if (Number.isFinite(dmajor) && dmajor !== 0) {
    parts.push(dmajor < 0 ? 'fewer major GC' : 'more major GC');
  }
  if (Number.isFinite(dold) && Math.abs(dold) >= thr * 0.3) {
    parts.push(dold < 0 ? 'less old_space used (peak)' : 'more old_space used (peak)');
  }
  if (Number.isFinite(dnew) && Math.abs(dnew) >= thr * 0.3) {
    parts.push(dnew < 0 ? 'less new_space used (peak)' : 'more new_space used (peak)');
  }
  if (Number.isFinite(dp95) && base.latencyP95Median > 0 && Math.abs(dp95 / base.latencyP95Median) >= 0.15) {
    parts.push(dp95 < 0 ? 'lower op latency p95' : 'higher op latency p95');
  }
  if (!parts.length) return 'no strong delta vs baseline';
  return parts.join('; ');
}

const cols = [
  { name: 'label', w: 22, get: (r) => r.label },
  { name: 'n', w: 3, get: (r) => String(r.count) },
  { name: 'rss-max', w: 10, get: (r) => fmtMb(r.rssMaxMedian) },
  { name: 'Δrss', w: 10, get: (r) => (r._drss === undefined ? '—' : fmtMbSigned(r._drss)) },
  { name: 'rss-final', w: 10, get: (r) => fmtMb(r.rssFinalMedian) },
  { name: 'heap-tot', w: 10, get: (r) => fmtMb(r.heapTotalMaxMedian) },
  { name: 'Δhtot', w: 10, get: (r) => (r._dheapTot === undefined ? '—' : fmtMbSigned(r._dheapTot)) },
  { name: 'old_sp', w: 10, get: (r) => fmtMb(r.oldSpaceUsedMaxMedian) },
  { name: 'new_sp', w: 10, get: (r) => fmtMb(r.newSpaceUsedMaxMedian) },
  { name: 'gc-%', w: 8, get: (r) => fmtPct(r.gcRatioMedian) },
  { name: 'maj', w: 4, get: (r) => String(Math.round(r.majorGcMedian)) },
  { name: 'min', w: 4, get: (r) => String(Math.round(r.minorGcMedian)) },
];

function row(values) {
  return values.map((v, i) => String(v).padEnd(cols[i].w)).join(' │ ');
}

const summaries = [...groupByLabel(runs).entries()]
  .map(([label, items]) => summarize(label, items))
  .sort((a, b) => a.label.localeCompare(b.label));

const baseline =
  summaries.find((s) => s.label === 'default') ||
  summaries.find((s) => s.label === 'balancer-default-c') ||
  summaries[0];

for (const r of summaries) {
  r._drss = r.rssMaxMedian - baseline.rssMaxMedian;
  r._dheapTot = r.heapTotalMaxMedian - baseline.heapTotalMaxMedian;
  r._verdict = verdict(baseline, r);
}

const header = row(cols.map((c) => c.name));
const sep = cols.map((c) => '─'.repeat(c.w)).join('─┼─');

console.log('\n' + header);
console.log(sep);
for (const r of summaries) {
  console.log(row(cols.map((c) => c.get(r))));
}
console.log('');

console.log(`Baseline: ${baseline.label}`);
console.log('');
console.log('Verdict (vs baseline)');
for (const r of summaries) {
  console.log(`  ${r.label.padEnd(22)} ${r._verdict}`);
}
console.log('');

const phaseNames = [...new Set(summaries.flatMap((s) => Object.keys(s.phases || {})))];
if (phaseNames.length) {
  console.log('Phase summaries');
  for (const phase of phaseNames) {
    console.log(`\n  ${phase}`);
    console.log('  ' + ['label', 'rss-max', 'rss-final', 'heap-tot', 'gc-%', 'maj', 'min', 'p95'].map((x) => x.padEnd(12)).join(' │ '));
    console.log('  ' + ['────────────', '────────────', '────────────', '────────────', '────────────', '────────────', '────────────', '────────────'].join('─┼─'));
    for (const s of summaries) {
      const p = s.phases[phase];
      if (!p) continue;
      console.log(
        '  ' +
          [
            s.label,
            fmtMb(p.rssMax),
            fmtMb(p.rssFinal),
            fmtMb(p.heapTotalMax),
            fmtPct(p.gcRatio),
            String(Math.round(p.majorGc)),
            String(Math.round(p.minorGc)),
            Number.isFinite(p.latencyP95) ? fmtMs(p.latencyP95) : 'n/a',
          ]
            .map((x) => String(x).padEnd(12))
            .join(' │ ')
      );
    }
  }
  console.log('');
}

const warns = [];
if (baseline.count < 3) warns.push(`Low repeat count (n=${baseline.count}); prefer REPEATS>=5.`);
if (summaries.some((s) => s.rssSpreadRatio > 0.12)) warns.push('High RSS spread across repeats for some labels; check noise or raise REPEATS.');
if (summaries.some((s) => s.diagnostic)) warns.push('Trace/diagnostic flags present; treat RSS/GC as explanatory, not a clean benchmark.');
if (summaries.some((s) => s.legacyNoSpaces)) warns.push('Some runs lack heap space stats (legacy JSON); re-run bench with current metrics.js.');
if (warns.length) {
  console.log('Warnings');
  for (const w of warns) console.log(`  - ${w}`);
  console.log('');
}

const lowRssRun = summaries.reduce((a, b) => (a.rssMaxMedian < b.rssMaxMedian ? a : b));
const lowHeapRun = summaries.reduce((a, b) => (a.heapMaxMedian < b.heapMaxMedian ? a : b));
const lowGcRun = summaries.reduce((a, b) => (a.gcRatioMedian < b.gcRatioMedian ? a : b));

console.log(`Lowest median RSS peak    : ${lowRssRun.label}  (${fmtMb(lowRssRun.rssMaxMedian)})`);
console.log(`Lowest median heap used   : ${lowHeapRun.label}  (${fmtMb(lowHeapRun.heapMaxMedian)})`);
console.log(`Lowest median GC ratio    : ${lowGcRun.label}  (${fmtPct(lowGcRun.gcRatioMedian)})`);
console.log('');
