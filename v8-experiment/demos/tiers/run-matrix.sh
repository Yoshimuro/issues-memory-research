#!/usr/bin/env bash
# Матрица «почему не всегда TurboFan»: 3 рантайма × варианты флагов × 5 повторов.
# Каждый (runtime, variant, rep) — ОТДЕЛЬНЫЙ процесс, строго последовательно.
# Плюс один trace-прогон на (runtime, variant) с --trace-opt --trace-deopt -> счётчики компиляций/деоптов.
# raw-runs.jsonl (все повторы) + traces.jsonl (счётчики) -> collect.js -> results.jsonl (медианы).
set -uo pipefail
cd "$(dirname "$0")"

declare -A RT=(
  [node20]=/opt/node20/bin/node
  [node22]=/opt/node22/bin/node
  [node24]=/opt/nvm/versions/node/v24.21.0/bin/node
)
# variant=flags ; пустые флаги = default. Порядок важен для отчёта.
declare -A VARIANTS=(
  [node20]="default= always-turbofan=--always-turbofan always-sparkplug=--always-sparkplug no-sparkplug=--no-sparkplug no-opt=--no-turbofan jitless=--jitless lite-mode=--lite-mode eager=--interrupt-budget=1000"
  [node22]="default= always-turbofan=--always-turbofan always-sparkplug=--always-sparkplug no-sparkplug=--no-sparkplug no-opt=--no-turbofan,--no-maglev maglev=--maglev jitless=--jitless lite-mode=--lite-mode eager=--invocation-count-for-turbofan=100,--invocation-count-for-maglev=20"
  [node24]="default= always-turbofan=--always-turbofan always-sparkplug=--always-sparkplug no-sparkplug=--no-sparkplug no-opt=--no-turbofan,--no-maglev no-maglev=--no-maglev jitless=--jitless lite-mode=--lite-mode eager=--invocation-count-for-turbofan=100,--invocation-count-for-maglev=20 turbolev=--turbolev"
)
REPS=${REPS:-5}
export N_COLD=${N_COLD:-2000} HOT_MS=${HOT_MS:-1500} UNSTABLE_N=${UNSTABLE_N:-20000}
mkdir -p artifacts/trace-counts
: > raw-runs.jsonl
: > traces.jsonl
echo "params: N_COLD=$N_COLD HOT_MS=$HOT_MS UNSTABLE_N=$UNSTABLE_N REPS=$REPS"
T0=$(date +%s)
for rt in node20 node22 node24; do
  bin=${RT[$rt]}
  for spec in ${VARIANTS[$rt]}; do
    v=${spec%%=*}; flags=${spec#*=}; flags=${flags//,/ }
    for rep in $(seq 1 "$REPS"); do
      out=$(VARIANT=$v "$bin" $flags always-turbofan-bench.js 2>artifacts/trace-counts/.stderr); rc=$?
      line=$(printf '%s\n' "$out" | grep '^{' | tail -1)
      if [ $rc -eq 0 ] && [ -n "$line" ]; then
        printf '{"runtime":"%s","variant":"%s","rep":%s,"data":%s}\n' "$rt" "$v" "$rep" "$line" >> raw-runs.jsonl
      else
        err=$(head -c 300 artifacts/trace-counts/.stderr | tr '\n"' '  ')
        printf '{"runtime":"%s","variant":"%s","rep":%s,"data":{"error":"exit %s: %s"}}\n' "$rt" "$v" "$rep" "$rc" "$err" >> raw-runs.jsonl
      fi
    done
    # trace-прогон: счётчики компиляций и деоптов (один процесс, результат по времени не используется)
    tf=artifacts/trace-counts/$rt-$v.txt
    VARIANT=$v "$bin" $flags --trace-opt --trace-deopt always-turbofan-bench.js > "$tf.full" 2>&1; trc=$?
    mag=$(grep -c 'completed compiling.*target MAGLEV' "$tf.full")
    tfc=$(grep -ci 'completed compiling.*target TURBOFAN' "$tf.full")
    deo=$(grep -c 'bailout (kind' "$tf.full")
    mark=$(grep -c '^\[marking' "$tf.full")
    alw=$(grep -c 'because --always-turbofan' "$tf.full")
    { echo "# $rt $v flags='$flags' exit=$trc  lines=$(wc -l < "$tf.full")"
      echo "# completed MAGLEV=$mag TURBOFAN=$tfc marking=$mark because-always-turbofan=$alw bailouts=$deo"
      echo "# bailout reasons:"; grep -o 'reason: [^)]*): begin. deoptimizing [^ ]* <JSFunction [^ ]*' "$tf.full" | sed 's/): begin. deoptimizing [^ ]* </ @ /' | sort | uniq -c | sort -rn | sed 's/^/  /'
      echo "# первые 12 строк с hot/unstable/anonymous:"; grep -E 'hotA|hotB|hotC|unstable|anonymous' "$tf.full" | head -12 | cut -c1-220
      echo "# bailout-строки (первые 8):"; grep 'bailout (kind' "$tf.full" | head -8 | cut -c1-220
    } > "$tf"
    rm -f "$tf.full"
    printf '{"runtime":"%s","variant":"%s","maglevCompiles":%s,"turbofanCompiles":%s,"markings":%s,"alwaysTurbofanLines":%s,"deopts":%s,"traceExit":%s}\n' \
      "$rt" "$v" "$mag" "$tfc" "$mark" "$alw" "$deo" "$trc" >> traces.jsonl
    echo "done: $rt $v  (+$(( $(date +%s) - T0 ))s)"
  done
done
rm -f artifacts/trace-counts/.stderr
${RT[node24]} collect.js
echo "TIERS_MATRIX_DONE in $(( $(date +%s) - T0 ))s"
