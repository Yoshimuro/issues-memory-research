#!/usr/bin/env bash
# Матрица: variant × BATCH × R, 5 повторов на ячейку, каждая ячейка — отдельный
# процесс node. Строго последовательно, ничего параллельно.
set -euo pipefail
export PATH=/opt/node24-local/bin:$PATH
cd "$(dirname "$0")"

: > results-real.jsonl
for v in mono-llm guard-llm mixed-mono; do
  for b in 500 5000; do
    for r in 1 5 20; do
      for rep in 1 2 3 4 5; do
        VARIANT=$v BATCH=$b R=$r REP=$rep node pipeline.js >> results-real.jsonl
        echo "cell $v b=$b R=$r rep=$rep -> $(tail -1 results-real.jsonl)"
      done
    done
  done
done
echo "MATRIX_DONE"
