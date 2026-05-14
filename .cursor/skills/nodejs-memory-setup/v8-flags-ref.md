# V8 Flag Decision Table

Source: empirical benchmarks on Node.js v22.20.0, macOS arm64 (darwin).
Workload: synchronous JSON processing, 50k iterations, 7 runs, bootstrap CI B=2000.

> **Linux caveat**: all data collected on macOS arm64. RSS measurement and GC behavior on Linux x86-64 with glibc/jemalloc may differ. Treat as directional guidance; profile in your actual environment.

---

## Tier 1 — Recommended for production

| Flag | Value | Δ RSS | Δ GC overhead | Notes |
|---|---|---|---|---|
| `--max-old-space-size` | 75% of container RAM | −29 MB (vs 4 GB default) | +27 major GCs | Strongest single flag. Use dynamic formula, not hardcoded value. |
| `--max-semi-space-size` | 32 | not benchmarked directly | unknown | 2 MB causes GC storm (+2158 minor GCs); 64 MB gives negligible gain. 32 MB is a pragmatic middle — **verify with profiling**. |

---

## Tier 2 — Situational

| Flag | Value | Δ RSS | Trade-off | When to use |
|---|---|---|---|---|
| `--lite-mode` | (boolean) | −83 MB | +8700 minor GCs, higher latency | IoT, batch jobs, latency-insensitive workloads |
| `--max-old-space-size` | 384 | −29 MB | +27 major GCs | Same effect as 256; use if 256 feels too tight |
| `--semi-space-growth-factor` | 16 | −5 MB | −391 minor GCs | Single-run evidence, medium confidence. Requires profiling before adopting. |

---

## Tier 3 — Never use in production

| Flag | Observed effect | Why harmful |
|---|---|---|
| `--memory-balancer` | −25 MB peak, **+52 MB final RSS** | Prevents memory release after load; GC count varies wildly between runs |
| `--memory-balancer-c-value=*` | −7–12 MB RSS | 12–14% gcRatio at any setting — catastrophic throughput loss |
| `--lazy-new-space-shrinking` | −0.7 MB peak, **+15 MB heap retained** | Holds unused semi-space pages indefinitely after idle |
| `--initial-old-space-size` | +44–+201 MB RSS | Pre-allocates old-space; cost exceeds any GC reduction |
| `--no-memory-reducer` | +30 MB RSS after idle | Disables idle-time compaction; memory never returns to OS |
| `--max-semi-space-size=2` | −17 MB RSS | +2158 minor GCs — GC storm |
| `--scavenger-max-new-space-capacity-mb` | 0–+3.5 MB RSS | V8 defaults are at or near optimal; manual tuning degrades |
| `--stress-concurrent-allocation` | +633–763 MB heapTotal | Internal V8 diagnostic flag only |

---

## Recommended baseline command

**Memory-constrained containers (Kubernetes, Docker, edge):**
```bash
node \
  --max-old-space-size=$(node -e "const os=require('os');process.stdout.write(String(Math.floor(os.totalmem()/1024/1024*0.75)))") \
  --max-semi-space-size=32 \
  app.js
```

Expected effect vs defaults: ~−29 MB RSS, negligible GC overhead increase.

**Extreme memory constraint (IoT, embedded):**
```bash
node \
  --max-old-space-size=$(node -e "const os=require('os');process.stdout.write(String(Math.floor(os.totalmem()/1024/1024*0.75)))") \
  --lite-mode \
  app.js
```

Expected effect vs defaults: ~−83 MB RSS, significant throughput reduction.
