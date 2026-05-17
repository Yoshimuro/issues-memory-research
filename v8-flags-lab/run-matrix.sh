#!/usr/bin/env bash
# run-matrix.sh — прогоняет sync-data-bench с разными V8-флагами
# и складывает JSON-результаты в ./results/sync/
#
# Использование:
#   ./run-matrix.sh                # все варианты
#   ./run-matrix.sh quick          # только 3 базовых
#
# Затем результаты сравнить через compare-runs.js

set -e

mkdir -p results/sync

ITERS="${ITERATIONS:-2000}"
PAYLOAD="${PAYLOAD_SIZE:-50000}"

run() {
  local label="$1"
  shift
  local out="results/sync/${label}.json"
  echo ""
  echo "▶ Running: $label"
  echo "  Flags: $*"
  ITERATIONS="$ITERS" PAYLOAD_SIZE="$PAYLOAD" LABEL="$label" OUT="$out" \
    node "$@" sync-data-bench.js
}

# ───── базовые варианты ─────
run "default"            # без флагов
run "small-old"          --max-old-space-size=256
run "tiny-semi"          --max-semi-space-size=2
run "big-semi"           --max-semi-space-size=64

if [[ "$1" != "quick" ]]; then
  # ───── расширенный набор ─────
  run "optimize-for-size"   --optimize-for-size
  run "expose-gc"           --expose-gc
  run "combo-prod"          --max-old-space-size=512  --max-semi-space-size=64
  run "trace-gc"            --trace-gc 2>results/sync/trace-gc.log >/dev/null || true
fi

echo ""
echo "✓ All runs done. Results in ./results/sync/"
echo "  Compare them: node compare-runs.js results/sync"
