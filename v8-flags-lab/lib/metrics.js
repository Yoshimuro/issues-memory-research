'use strict';

const fs = require('node:fs');
const path = require('node:path');
const v8 = require('node:v8');
const { performance, PerformanceObserver, constants } = require('node:perf_hooks');

const GC_KIND = {
  [constants.NODE_PERFORMANCE_GC_MAJOR]: 'major',
  [constants.NODE_PERFORMANCE_GC_MINOR]: 'minor',
  [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: 'incremental',
  [constants.NODE_PERFORMANCE_GC_WEAKCB]: 'weakcb',
};

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function fmtMs(n) {
  if (n < 1) return `${n.toFixed(3)} ms`;
  if (n < 1000) return `${n.toFixed(1)} ms`;
  return `${(n / 1000).toFixed(2)} s`;
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[idx];
}

function heapSpaceSnapshot() {
  return v8.getHeapSpaceStatistics().map((s) => ({
    space_name: s.space_name,
    space_size: s.space_size,
    space_used_size: s.space_used_size,
    space_available_size: s.space_available_size,
  }));
}

function summarizeHeapSpaces(samples) {
  const byName = new Map();
  for (const s of samples) {
    const spaces = s.heapSpaces;
    if (!spaces) continue;
    for (const sp of spaces) {
      const name = sp.space_name;
      if (!byName.has(name)) {
        byName.set(name, { used: [], size: [], avail: [], finals: [] });
      }
      const b = byName.get(name);
      b.used.push(sp.space_used_size);
      b.size.push(sp.space_size);
      b.avail.push(sp.space_available_size);
    }
  }
  const last = samples[samples.length - 1];
  const lastSpaces = last?.heapSpaces;
  const out = {};
  for (const [name, b] of byName) {
    const fin = lastSpaces?.find((x) => x.space_name === name);
    out[name] = {
      usedMax: Math.max(...b.used),
      sizeMax: Math.max(...b.size),
      availableMin: Math.min(...b.avail),
      usedFinal: fin ? fin.space_used_size : b.used[b.used.length - 1],
      sizeFinal: fin ? fin.space_size : b.size[b.size.length - 1],
    };
  }
  return out;
}

function summarizeMemory(samples) {
  const rssVals = samples.map((s) => s.rss);
  const heapVals = samples.map((s) => s.heapUsed);
  const heapTotalVals = samples.map((s) => s.heapTotal);
  const externalVals = samples.map((s) => s.external);
  const arrayBufferVals = samples.map((s) => s.arrayBuffers);
  const rssOtherVals = samples.map((s) => s.rssOtherApprox);
  const rssMax = Math.max(...rssVals);
  const rssFinal = rssVals[rssVals.length - 1];
  const heapTotalMax = Math.max(...heapTotalVals);
  const heapTotalFinal = heapTotalVals[heapTotalVals.length - 1];

  return {
    rssMin: Math.min(...rssVals),
    rssMax,
    rssFinal,
    rssFinalOverMax: rssMax > 0 ? rssFinal / rssMax : 1,
    heapMin: Math.min(...heapVals),
    heapMax: Math.max(...heapVals),
    heapFinal: heapVals[heapVals.length - 1],
    heapTotalMax,
    heapTotalFinal,
    heapTotalFinalOverMax: heapTotalMax > 0 ? heapTotalFinal / heapTotalMax : 1,
    externalMax: Math.max(...externalVals),
    externalFinal: externalVals[externalVals.length - 1],
    arrayBuffersMax: Math.max(...arrayBufferVals),
    arrayBuffersFinal: arrayBufferVals[arrayBufferVals.length - 1],
    rssOtherApproxMax: Math.max(...rssOtherVals),
    rssOtherApproxFinal: rssOtherVals[rssOtherVals.length - 1],
  };
}

function summarizeGc(gcEvents, totalMs) {
  const byKind = gcEvents.reduce((acc, e) => {
    acc[e.kind] = acc[e.kind] || { count: 0, totalMs: 0 };
    acc[e.kind].count += 1;
    acc[e.kind].totalMs += e.durationMs;
    return acc;
  }, {});
  const totalGcMs = gcEvents.reduce((s, e) => s + e.durationMs, 0);
  const getKindCount = (kind) => byKind[kind]?.count || 0;

  return {
    totalCount: gcEvents.length,
    totalMs: totalGcMs,
    gcRatio: totalMs > 0 ? totalGcMs / totalMs : 0,
    minorCount: getKindCount('minor'),
    majorCount: getKindCount('major'),
    byKind,
  };
}

function summarizeLatency(latencies) {
  const values = latencies.map((x) => (typeof x === 'number' ? x : x.ms));
  const sortedLat = [...values].sort((a, b) => a - b);
  return values.length
    ? {
        count: values.length,
        p50: percentile(sortedLat, 50),
        p95: percentile(sortedLat, 95),
        p99: percentile(sortedLat, 99),
        max: sortedLat[sortedLat.length - 1],
        avg: values.reduce((s, x) => s + x, 0) / values.length,
      }
    : null;
}

function summarizePhases(phaseMarkers, totalMs, samples, gcEvents, latencies) {
  return phaseMarkers.map((marker, index) => {
    const next = phaseMarkers[index + 1];
    const end = next ? next.t : totalMs;
    const phaseSamples = samples.filter((s) => s.t >= marker.t && s.t <= end);
    const selectedSamples = phaseSamples.length ? phaseSamples : [samples[samples.length - 1]];
    const phaseGc = gcEvents.filter((e) => e.t >= marker.t && e.t < end);
    const phaseLatencies = latencies.filter((l) => typeof l !== 'number' && l.phase === marker.name).map((l) => l.ms);
    const durationMs = Math.max(0, end - marker.t);

    return {
      name: marker.name,
      startMs: marker.t,
      endMs: end,
      durationMs,
      memory: summarizeMemory(selectedSamples),
      heapSpaces: summarizeHeapSpaces(selectedSamples),
      gc: summarizeGc(phaseGc, durationMs),
      latency: summarizeLatency(phaseLatencies),
    };
  });
}

function create({ label = 'run', outFile = null, sampleIntervalMs = 100, metadata = null } = {}) {
  const samples = [];
  const gcEvents = [];
  const latencies = [];
  const phaseMarkers = [];
  let startTime = 0;
  let endTime = 0;
  let sampler = null;
  let currentPhase = null;

  const gcObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      gcEvents.push({
        t: entry.startTime - startTime,
        kind: GC_KIND[entry.detail?.kind] || `unknown(${entry.detail?.kind})`,
        durationMs: entry.duration,
      });
    }
  });

  function takeSample() {
    const u = process.memoryUsage();
    const rssOther = u.rss - u.heapTotal - u.external;
    samples.push({
      t: performance.now() - startTime,
      rss: u.rss,
      heapUsed: u.heapUsed,
      heapTotal: u.heapTotal,
      external: u.external,
      arrayBuffers: u.arrayBuffers,
      rssOtherApprox: rssOther,
      heapSpaces: heapSpaceSnapshot(),
    });
  }

  return {
    label,

    start() {
      startTime = performance.now();
      endTime = 0;
      gcObserver.observe({ entryTypes: ['gc'] });
      takeSample();
      sampler = setInterval(takeSample, sampleIntervalMs);
      if (sampler.unref) sampler.unref();
    },

    stop() {
      endTime = performance.now();
      if (sampler) clearInterval(sampler);
      takeSample();
      try {
        gcObserver.disconnect();
      } catch (_) {
      }
    },

    recordLatency(ms) {
      latencies.push({ phase: currentPhase, ms });
    },

    timer() {
      const t0 = performance.now();
      const phase = currentPhase;
      return () => latencies.push({ phase, ms: performance.now() - t0 });
    },

    markPhase(name) {
      currentPhase = name;
      phaseMarkers.push({ name, t: performance.now() - startTime });
      takeSample();
    },

    summary() {
      const totalMs = (endTime || performance.now()) - startTime;
      const heapSpaces = summarizeHeapSpaces(samples);
      const memory = summarizeMemory(samples);
      const latencyStats = summarizeLatency(latencies);
      const gc = summarizeGc(gcEvents, totalMs);
      const phaseSummaries = summarizePhases(phaseMarkers, totalMs, samples, gcEvents, latencies);

      return {
        label,
        nodeVersion: process.version,
        totalMs,
        flags: process.execArgv,
        metadata: typeof metadata === 'function' ? metadata() : metadata,
        memory,
        heapSpaces,
        phaseSummaries,
        gc,
        latency: latencyStats,
      };
    },

    printSummary() {
      const s = this.summary();
      const line = '─'.repeat(64);

      console.log('\n' + line);
      console.log(`  RUN: ${s.label}`);
      console.log(`  Node: ${s.nodeVersion}`);
      if (s.flags.length) {
        console.log(`  Flags: ${s.flags.join(' ')}`);
      } else {
        console.log(`  Flags: (none — defaults)`);
      }
      console.log(line);

      console.log(`  Total time      : ${fmtMs(s.totalMs)}`);
      console.log('');
      console.log(`  Memory:`);
      console.log(`    RSS min/max   : ${fmtBytes(s.memory.rssMin)}  →  ${fmtBytes(s.memory.rssMax)}`);
      console.log(`    RSS final     : ${fmtBytes(s.memory.rssFinal)}`);
      console.log(`    Heap used max : ${fmtBytes(s.memory.heapMax)}`);
      console.log(`    Heap total max: ${fmtBytes(s.memory.heapTotalMax)}`);
      console.log(`    External max  : ${fmtBytes(s.memory.externalMax)}`);
      console.log(`    ArrayBuf max  : ${fmtBytes(s.memory.arrayBuffersMax)}`);
      console.log(`    RSS−heap−ext  : max ${fmtBytes(s.memory.rssOtherApproxMax)}  final ${fmtBytes(s.memory.rssOtherApproxFinal)}`);
      if (s.heapSpaces && Object.keys(s.heapSpaces).length) {
        console.log('');
        console.log(`  Heap spaces (peak used):`);
        const order = ['new_space', 'old_space', 'large_object_space', 'code_space', 'shared_space', 'shared_array_buffer'];
        const keys = [...new Set([...order.filter((k) => s.heapSpaces[k]), ...Object.keys(s.heapSpaces)])];
        for (const k of keys) {
          const hs = s.heapSpaces[k];
          if (!hs) continue;
          console.log(`    ${k.padEnd(22)} used ${fmtBytes(hs.usedMax)}  size ${fmtBytes(hs.sizeMax)}`);
        }
      }
      console.log('');
      console.log(`  GC:`);
      console.log(`    Total events  : ${s.gc.totalCount}`);
      console.log(`    Total in GC   : ${fmtMs(s.gc.totalMs)}  (${(s.gc.gcRatio * 100).toFixed(1)}% of run)`);
      for (const [kind, stats] of Object.entries(s.gc.byKind)) {
        console.log(`      ${kind.padEnd(12)}: ${String(stats.count).padStart(5)} events, ${fmtMs(stats.totalMs).padStart(10)}`);
      }

      if (s.latency) {
        console.log('');
        console.log(`  Latency (${s.latency.count} ops):`);
        console.log(`    avg / p50     : ${fmtMs(s.latency.avg)}  /  ${fmtMs(s.latency.p50)}`);
        console.log(`    p95 / p99     : ${fmtMs(s.latency.p95)}  /  ${fmtMs(s.latency.p99)}`);
        console.log(`    max           : ${fmtMs(s.latency.max)}`);
      }
      console.log(line + '\n');
    },

    saveJson() {
      if (!outFile) return;
      const dir = path.dirname(outFile);
      if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        outFile,
        JSON.stringify(
          {
            ...this.summary(),
            samples,
            gcEvents,
            latencies,
          },
          null,
          2
        )
      );
      console.log(`  Saved JSON: ${outFile}\n`);
    },
  };
}

module.exports = { create, fmtBytes, fmtMs };
