#!/usr/bin/env bash
# Матрица инвариантности: 4 бенча × кейсы × 4 рантайма (node20/22/24, d8).
# Каждый (runtime, bench, case, rep) — ОТДЕЛЬНЫЙ процесс: раннер приклеивает
# `globalThis.CASE='...'` первой строкой (работает и в node, и в d8).
# 5 повторов, медиана считается коллектором collect.js -> results.jsonl.
set -uo pipefail
cd "$(dirname "$0")"

declare -A RT=(
  [node20]=/opt/node20/bin/node
  [node22]=/opt/node22/bin/node
  [node24]=/opt/node24-local/bin/node
  [d8]="$HOME/.jsvu/bin/v8"
)

declare -A CASES=(
  [ic-mono-mega]="1 2 4 8"
  [elements-kinds]="SMI DOUBLE HOLEY ELEMENTS"
  [delete-dict]="fast delete undefined"
  [trycatch-myth]="naive-pair honest-plain honest-try"
)

: > raw-runs.jsonl
for rt in node20 node22 node24 d8; do
  bin=${RT[$rt]}
  for benchf in ic-mono-mega elements-kinds delete-dict trycatch-myth; do
    for c in ${CASES[$benchf]}; do
      for rep in 1 2 3 4 5; do
        tmp=$(mktemp --suffix=.js)
        printf "globalThis.CASE='%s';\n" "$c" > "$tmp"
        cat "$benchf.js" >> "$tmp"
        lines=$("$bin" --allow-natives-syntax "$tmp" 2>/dev/null | grep '^{')
        rm -f "$tmp"
        if [ -n "$lines" ]; then
          while IFS= read -r line; do
            printf '{"runtime":"%s","rep":%s,"data":%s}\n' "$rt" "$rep" "$line" >> raw-runs.jsonl
          done <<< "$lines"
        else
          printf '{"runtime":"%s","rep":%s,"data":{"bench":"%s","case":"%s","error":"no output"}}\n' \
            "$rt" "$rep" "$benchf" "$c" >> raw-runs.jsonl
        fi
      done
      echo "done: $rt $benchf/$c"
    done
  done
done
/opt/node24-local/bin/node collect.js
echo "MYTHS_MATRIX_DONE"
