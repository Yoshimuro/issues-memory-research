'use strict';

const MB = 1024 * 1024;

const TH = {
  rssMaterial: 0.5 * MB,
  rssLarge: 1 * MB,
  heapTotalMaterial: 0.5 * MB,
  externalMaterial: 0.25 * MB,
  minorGc: 3,
  majorGc: 1,
  gcRatio: 0.0005,
  oldSpaceUsed: 0.3 * MB,
};

const STRONG_SYNC_ENV = {
  REPEATS: '7',
  WARMUP_ITERATIONS: '5000',
  SPIKE_ITERATIONS: '10000',
  STEADY_ITERATIONS: '50000',
  ITERATIONS: '50000',
  IDLE_S: '60',
  YIELD_EVERY: '10',
  PAYLOAD_SIZE: '50000',
};

const STRONG_MATRIX = [
  { experiment: 'max-semi-space-size', profile: 'new-space-pressure' },
  { experiment: 'semi-space-growth-factor', profile: 'new-space-pressure' },
  { experiment: 'scavenger-max-new-space-capacity-mb', profile: 'new-space-pressure' },
  { experiment: 'lazy-new-space-shrinking', profile: 'new-space-pressure' },
  { experiment: 'max-old-space-size', profile: 'old-space-pressure' },
  { experiment: 'initial-old-space-size', profile: 'old-space-pressure' },
  { experiment: 'heap-preset', profile: 'old-space-pressure' },
  { experiment: 'memory-balancer', profile: 'old-space-pressure' },
  { experiment: 'memory-balancer-c-value', profile: 'old-space-pressure' },
  { experiment: 'memory-reducer', profile: 'idle-recovery', idleS: 120 },
  { experiment: 'memory-reducer-small-heaps', profile: 'idle-recovery', idleS: 120 },
  { experiment: 'lazy-new-space-shrinking', profile: 'idle-recovery', idleS: 120 },
  { experiment: 'memory-balancer', profile: 'idle-recovery', idleS: 120 },
  { experiment: 'heap-preset', profile: 'external-pressure' },
  { experiment: 'max-old-space-size', profile: 'external-pressure' },
  { experiment: 'max-semi-space-size', profile: 'external-pressure' },
  { experiment: 'initial-old-space-size', profile: 'external-pressure' },
  { experiment: 'lite-mode', profile: 'old-space-pressure' },
  { experiment: 'lite-mode', profile: 'new-space-pressure' },
  { experiment: 'stress-concurrent-allocation', profile: 'old-space-pressure' },
  { experiment: 'stress-concurrent-allocation', profile: 'new-space-pressure' },
];

function experimentDecisionClass(name, pressureProfile) {
  if (pressureProfile === 'external-pressure') return 'externalFootprint';
  if (
    name === 'semi-space-growth-factor' ||
    name === 'max-semi-space-size' ||
    name === 'scavenger-max-new-space-capacity-mb'
  ) {
    return 'newSpaceAllocation';
  }
  if (name === 'lazy-new-space-shrinking') return 'newSpaceShrink';
  if (name === 'max-old-space-size' || name === 'initial-old-space-size' || name === 'heap-preset') {
    return 'oldSpaceHeap';
  }
  if (name === 'memory-balancer') return 'memoryBalancer';
  if (name === 'memory-balancer-c-value') return 'balancerTuning';
  if (name === 'memory-reducer' || name === 'memory-reducer-small-heaps') return 'memoryReducer';
  if (name === 'lite-mode') return 'liteMode';
  if (name === 'stress-concurrent-allocation') return 'stressConcurrent';
  if (name === 'predictable-gc-schedule') return 'diagnosticSchedule';
  if (name === 'trace-memory-balancer') return 'diagnosticTrace';
  return 'unknown';
}

function ciConflictsZero(ciLow, ciHigh) {
  return ciLow <= 0 && ciHigh >= 0;
}

function confidentAbove(ciLow, ciHigh, thr) {
  return ciLow > thr;
}

function confidentBelow(ciLow, ciHigh, thr) {
  return ciHigh < thr;
}

function decide({ experimentName, pressureProfile, variantLabel, boots, baselineN, variantN }) {
  const cls = experimentDecisionClass(experimentName, pressureProfile);
  if (cls === 'diagnosticSchedule' || cls === 'diagnosticTrace') {
    return { label: variantLabel, decision: 'diagnostic_only', reason: 'trace_or_control_schedule_not_benchmark_comparable' };
  }
  if (baselineN < 3 || variantN < 3) {
    return { label: variantLabel, decision: 'inconclusive', reason: 'low_n' };
  }

  const b = (key) => boots[key] || { medianDiff: 0, ciLow: 0, ciHigh: 0, consistency: 0 };

  if (cls === 'unknown') {
    return { label: variantLabel, decision: 'inconclusive', reason: 'unknown_experiment_class' };
  }

  if (cls === 'externalFootprint') {
    const ext = b('externalMax');
    const ab = b('arrayBuffersMax');
    const rss = b('rssMax');
    const extHelp =
      confidentBelow(ext.ciLow, ext.ciHigh, -TH.externalMaterial) ||
      confidentBelow(ab.ciLow, ab.ciHigh, -TH.externalMaterial);
    const rssHarm = confidentAbove(rss.ciLow, rss.ciHigh, TH.rssMaterial);
    const noSignal =
      ciConflictsZero(ext.ciLow, ext.ciHigh) &&
      ciConflictsZero(ab.ciLow, ab.ciHigh) &&
      ciConflictsZero(rss.ciLow, rss.ciHigh) &&
      Math.abs(ext.medianDiff) < TH.externalMaterial &&
      Math.abs(rss.medianDiff) < TH.rssMaterial;
    if (noSignal) return { label: variantLabel, decision: 'no_visible_effect', reason: 'external_and_rss_not_material' };
    if (extHelp && !rssHarm) return { label: variantLabel, decision: 'recommended', reason: 'lower_external_or_buffers_without_rss_penalty' };
    if (extHelp && rssHarm) return { label: variantLabel, decision: 'conditional', reason: 'external_down_but_rss_up' };
    if (!extHelp && rssHarm) return { label: variantLabel, decision: 'not_recommended', reason: 'rss_up_without_external_reduction' };
    return { label: variantLabel, decision: 'inconclusive', reason: 'external_profile_mixed' };
  }

  if (cls === 'newSpaceAllocation') {
    const minor = b('steadyMinorGc');
    const rss = b('rssMax');
    const minorHelp =
      confidentBelow(minor.ciLow, minor.ciHigh, -TH.minorGc) ||
      (!ciConflictsZero(minor.ciLow, minor.ciHigh) && minor.medianDiff <= -TH.minorGc);
    const rssHarm = confidentAbove(rss.ciLow, rss.ciHigh, TH.rssMaterial);
    const rssOk = !confidentAbove(rss.ciLow, rss.ciHigh, TH.rssMaterial);
    const noSignal =
      ciConflictsZero(minor.ciLow, minor.ciHigh) &&
      ciConflictsZero(rss.ciLow, rss.ciHigh) &&
      Math.abs(minor.medianDiff) < TH.minorGc &&
      Math.abs(rss.medianDiff) < TH.rssMaterial;
    if (noSignal) return { label: variantLabel, decision: 'no_visible_effect', reason: 'steady_minor_and_rss_ci_not_material' };
    if (minorHelp && rssHarm) return { label: variantLabel, decision: 'conditional', reason: 'fewer_minor_gc_with_higher_rss_confident' };
    if (minorHelp && rssOk) return { label: variantLabel, decision: 'recommended', reason: 'fewer_minor_gc_without_confident_rss_penalty' };
    if (!minorHelp && rssHarm) return { label: variantLabel, decision: 'not_recommended', reason: 'rss_up_without_minor_gc_benefit' };
    return { label: variantLabel, decision: 'inconclusive', reason: 'mixed_gc_and_footprint_ci' };
  }

  if (cls === 'newSpaceShrink') {
    const rssI = b('idleRssFinal');
    const htI = b('idleHeapTotalFinal');
    const idleHelp =
      confidentBelow(rssI.ciLow, rssI.ciHigh, -TH.rssMaterial) ||
      confidentBelow(htI.ciLow, htI.ciHigh, -TH.heapTotalMaterial);
    const idleHarm =
      confidentAbove(rssI.ciLow, rssI.ciHigh, TH.rssMaterial) ||
      confidentAbove(htI.ciLow, htI.ciHigh, TH.heapTotalMaterial);
    const noSignal =
      ciConflictsZero(rssI.ciLow, rssI.ciHigh) &&
      ciConflictsZero(htI.ciLow, htI.ciHigh) &&
      Math.abs(rssI.medianDiff) < TH.rssMaterial &&
      Math.abs(htI.medianDiff) < TH.heapTotalMaterial;
    if (noSignal) return { label: variantLabel, decision: 'no_visible_effect', reason: 'idle_footprint_ci_not_material' };
    if (idleHelp) return { label: variantLabel, decision: 'recommended', reason: 'lower_idle_rss_or_heap_total_confident' };
    if (idleHarm) return { label: variantLabel, decision: 'not_recommended', reason: 'higher_idle_footprint_confident' };
    return { label: variantLabel, decision: 'conditional', reason: 'idle_tradeoff_mixed' };
  }

  if (cls === 'memoryReducer') {
    const rssI = b('idleRssFinal');
    const htI = b('idleHeapTotalFinal');
    const help =
      confidentBelow(rssI.ciLow, rssI.ciHigh, -TH.rssMaterial) ||
      confidentBelow(htI.ciLow, htI.ciHigh, -TH.heapTotalMaterial);
    const noSignal =
      ciConflictsZero(rssI.ciLow, rssI.ciHigh) &&
      ciConflictsZero(htI.ciLow, htI.ciHigh) &&
      Math.abs(rssI.medianDiff) < TH.rssMaterial &&
      Math.abs(htI.medianDiff) < TH.heapTotalMaterial;
    if (noSignal) return { label: variantLabel, decision: 'no_visible_effect', reason: 'idle_recovery_not_material' };
    if (help) return { label: variantLabel, decision: 'recommended', reason: 'lower_idle_footprint_confident' };
    return { label: variantLabel, decision: 'conditional', reason: 'idle_effect_present_but_not_clearly_beneficial' };
  }

  if (cls === 'oldSpaceHeap') {
    const major = b('majorGc');
    const old = b('oldSpaceUsedMax');
    const rss = b('rssMax');
    const majorHelp = confidentBelow(major.ciLow, major.ciHigh, -TH.majorGc) || major.medianDiff <= -TH.majorGc;
    const oldHelp = confidentBelow(old.ciLow, old.ciHigh, -TH.oldSpaceUsed);
    const rssHarm = confidentAbove(rss.ciLow, rss.ciHigh, TH.rssLarge);
    const noSignal =
      ciConflictsZero(major.ciLow, major.ciHigh) &&
      ciConflictsZero(old.ciLow, old.ciHigh) &&
      ciConflictsZero(rss.ciLow, rss.ciHigh);
    if (noSignal && Math.abs(major.medianDiff) < TH.majorGc && Math.abs(rss.medianDiff) < TH.rssMaterial) {
      return { label: variantLabel, decision: 'no_visible_effect', reason: 'heap_and_gc_ci_not_material' };
    }
    if ((majorHelp || oldHelp) && rssHarm) return { label: variantLabel, decision: 'conditional', reason: 'heap_gc_signal_with_rss_cost' };
    if (majorHelp || oldHelp) return { label: variantLabel, decision: 'recommended', reason: 'heap_or_major_gc_improved' };
    if (rssHarm && !majorHelp && !oldHelp) return { label: variantLabel, decision: 'not_recommended', reason: 'rss_up_without_old_space_benefit' };
    return { label: variantLabel, decision: 'inconclusive', reason: 'old_space_mixed_ci' };
  }

  if (cls === 'memoryBalancer') {
    const gcr = b('gcRatio');
    const ht = b('heapTotalMax');
    const gcrHelp = confidentBelow(gcr.ciLow, gcr.ciHigh, -TH.gcRatio);
    const htHarm = confidentAbove(ht.ciLow, ht.ciHigh, TH.heapTotalMaterial);
    const noSignal = ciConflictsZero(gcr.ciLow, gcr.ciHigh) && ciConflictsZero(ht.ciLow, ht.ciHigh);
    if (noSignal) return { label: variantLabel, decision: 'no_visible_effect', reason: 'balancer_signals_not_material' };
    if (gcrHelp && !htHarm) return { label: variantLabel, decision: 'recommended', reason: 'lower_gc_ratio_without_heap_penalty' };
    if (gcrHelp && htHarm) return { label: variantLabel, decision: 'conditional', reason: 'lower_gc_ratio_with_heap_total_cost' };
    return { label: variantLabel, decision: 'inconclusive', reason: 'balancer_tradeoff_mixed' };
  }

  if (cls === 'balancerTuning') {
    const gcr = b('gcRatio');
    const ht = b('heapTotalMax');
    const anySignal =
      !ciConflictsZero(gcr.ciLow, gcr.ciHigh) ||
      !ciConflictsZero(ht.ciLow, ht.ciHigh) ||
      Math.abs(gcr.medianDiff) >= TH.gcRatio ||
      Math.abs(ht.medianDiff) >= TH.heapTotalMaterial;
    if (!anySignal) return { label: variantLabel, decision: 'no_visible_effect', reason: 'c_value_sweep_no_material_delta' };
    return { label: variantLabel, decision: 'conditional', reason: 'c_value_tuning_requires_goal_specific_weighting' };
  }

  if (cls === 'liteMode') {
    const rss = b('rssMax');
    const ht = b('heapTotalMax');
    const rssHelp = confidentBelow(rss.ciLow, rss.ciHigh, -TH.rssLarge);
    const htHelp = confidentBelow(ht.ciLow, ht.ciHigh, -TH.heapTotalMaterial);
    const rssHarm = confidentAbove(rss.ciLow, rss.ciHigh, TH.rssLarge);
    const noSignal =
      ciConflictsZero(rss.ciLow, rss.ciHigh) &&
      ciConflictsZero(ht.ciLow, ht.ciHigh) &&
      Math.abs(rss.medianDiff) < TH.rssMaterial &&
      Math.abs(ht.medianDiff) < TH.heapTotalMaterial;
    if (noSignal) return { label: variantLabel, decision: 'no_visible_effect', reason: 'lite_mode_footprint_not_material' };
    if (rssHelp || htHelp) return { label: variantLabel, decision: 'recommended', reason: 'lower_rss_or_heap_total_consistent_with_memory_savings_tradeoff' };
    if (rssHarm) return { label: variantLabel, decision: 'not_recommended', reason: 'lite_mode_increased_rss_unexpectedly' };
    return { label: variantLabel, decision: 'conditional', reason: 'lite_mode_tradeoff_mixed' };
  }

  if (cls === 'stressConcurrent') {
    const rss = b('rssMax');
    const ht = b('heapTotalMax');
    const noSignal =
      ciConflictsZero(rss.ciLow, rss.ciHigh) &&
      ciConflictsZero(ht.ciLow, ht.ciHigh) &&
      Math.abs(rss.medianDiff) < TH.rssLarge &&
      Math.abs(ht.medianDiff) < TH.heapTotalMaterial;
    if (noSignal) return { label: variantLabel, decision: 'diagnostic_only', reason: 'stress_threads_no_material_footprint_change' };
    const rssHarm = confidentAbove(rss.ciLow, rss.ciHigh, TH.rssLarge);
    if (rssHarm) return { label: variantLabel, decision: 'diagnostic_only', reason: 'stress_threads_increased_rss_under_concurrent_allocation' };
    return { label: variantLabel, decision: 'diagnostic_only', reason: 'stress_threads_signal_present_for_diagnostics' };
  }

  return { label: variantLabel, decision: 'inconclusive', reason: 'unhandled_class' };
}

module.exports = {
  MB,
  TH,
  STRONG_SYNC_ENV,
  STRONG_MATRIX,
  experimentDecisionClass,
  decide,
};
