---
name: nodejs-memory-setup
description: Audit Node.js memory setup on Debian/Linux: verify jemalloc/tcmalloc allocator
  via LD_PRELOAD or Dockerfile ENV, check V8 heap flags in start scripts/PM2/systemd,
  and confirm eslint-plugin-node-memory rules are active. Use when reviewing Node.js
  deployment config, Dockerfiles, PM2 ecosystem files, systemd units, or when the user
  asks about Node.js memory optimization on Linux/Debian.
---

# Node.js Memory Setup Audit

## Installation (Cursor & Claude Code)

Copy this skill into your project's `.cursor/skills/` directory:

```bash
cp -r node_modules/eslint-plugin-node-memory/.cursor/skills/nodejs-memory-setup \
  .cursor/skills/
```

**Cursor**: skill is auto-discovered from `.cursor/skills/`.
**Claude Code**: invoke with `Skill("nodejs-memory-setup")` or the agent picks it up from the `description` field.

---

## Audit Checklist

Run through all three layers in order.

### Layer 1 — Memory Allocator

Debian uses glibc ptmalloc2 by default. On Linux x86-64, jemalloc reduces fragmentation and gives more predictable RSS.

**Check for existing allocator config:**
```bash
rg -l "LD_PRELOAD" .
rg "libjemalloc|libtcmalloc|libmimalloc" Dockerfile* docker-compose* .env* ecosystem* *.service
```

**Install jemalloc on Debian:**
```bash
apt-get install -y libjemalloc2
```

**Activate via LD_PRELOAD:**
```bash
LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2 node app.js
```

**Where to set it by environment:**

| Environment | Location |
|---|---|
| Docker | `ENV LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libjemalloc.so.2` in Dockerfile |
| PM2 | `env: { LD_PRELOAD: "..." }` in ecosystem.config.js |
| systemd | `Environment=LD_PRELOAD=...` in the `[Service]` section |

**Verify it loaded:**
```bash
node -e "const r=process.report.getReport(); console.log(r.sharedObjects.filter(s=>s.includes('jemalloc')))"
```

> Note: V8 flag benchmarks were done on macOS arm64. RSS behavior on Linux x86-64 with ptmalloc2 vs jemalloc may differ — measure in your actual environment.

---

### Layer 2 — V8 Heap Flags

See [v8-flags-ref.md](v8-flags-ref.md) for the full decision table.

**Quick check — scan start scripts for flag usage:**
```bash
rg -- "--max-old-space-size|--semi-space|--memory-balancer|--lazy-new-space|--initial-old-space|--lite-mode|--no-memory-reducer" \
  package.json ecosystem* Dockerfile* *.sh *.service .env*
```

**Recommended configuration for memory-constrained deployments (containers, edge):**

Compute `--max-old-space-size` at startup as 75% of available RAM:

```bash
NODE_MEM=$(node -e "const os=require('os');process.stdout.write(String(Math.floor(os.totalmem()/1024/1024*0.75)))")
node --max-old-space-size=$NODE_MEM --max-semi-space-size=32 app.js
```

In a Dockerfile:
```dockerfile
ENV NODE_OPTIONS=""
CMD ["sh", "-c", "node --max-old-space-size=$(node -e \"const os=require('os');process.stdout.write(String(Math.floor(os.totalmem()/1024/1024*0.75)))\") --max-semi-space-size=32 app.js"]
```

> `--max-semi-space-size=32` is a pragmatic middle ground. The empirical research tested 2 MB (too many GC pauses) and 64 MB (negligible RSS gain). 32 MB was not directly benchmarked — **verify with profiling in your workload**.

**Red flags — if any of these appear, remove them:**
```
--memory-balancer
--lazy-new-space-shrinking
--initial-old-space-size
--no-memory-reducer
--memory-balancer-c-value
--stress-concurrent-allocation
--max-semi-space-size=2
```

---

### Layer 3 — ESLint Plugin

**Check plugin is installed:**
```bash
rg "eslint-plugin-node-memory" package.json
```

**Check all four rules are active in eslint.config.js (or .eslintrc):**
```bash
rg "node-memory/" eslint.config.* .eslintrc.*
```

Expected rules:
```
node-memory/no-unread-fetch-response   → error
node-memory/no-textdecoder-in-loop     → warn
node-memory/explicit-to-web-strategy   → error
node-memory/require-stream-cleanup     → warn
```

**Quickest setup — use the recommended preset:**
```js
import plugin from 'eslint-plugin-node-memory';

export default [
  plugin.configs.recommended,
];
```

**Run lint to surface existing violations:**
```bash
npx eslint --rule 'node-memory/no-unread-fetch-response: error' src/
```

---

## Summary

| Layer | Tool | Key action |
|---|---|---|
| Allocator | jemalloc via LD_PRELOAD | apt-get + ENV / ecosystem / systemd |
| V8 flags | node CLI / NODE_OPTIONS | 75% RAM for old-space, 32 MB semi-space |
| Code patterns | eslint-plugin-node-memory | all 4 rules active, use recommended preset |
