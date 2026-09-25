#!/usr/bin/env bash
# Матрица «почему не всегда TurboFan»: 3 рантайма × варианты флагов × REPS повторов.
# Каждый (runtime, variant, rep) — ОТДЕЛЬНЫЙ процесс, строго последовательно.
# Каждый повтор идёт с --trace-deopt: по нему считаются деопты за прогон (в т.ч. функций-циклов харнеса).
# Плюс один trace-прогон на (runtime, variant) с --trace-opt --trace-deopt -> счётчики компиляций/деоптов;
# полный лог trace-прогона сохраняется в artifacts/trace-full/ (4–13k строк, нужен для проверки утверждений).
# raw-runs.jsonl (все повторы) + traces.jsonl (счётчики) -> collect.js -> results.jsonl (медианы + min/max).
set -uo pipefail
cd "$(dirname "$0")"

declare -A RT=(
  [node20]=/opt/node20/bin/node
  [node22]=/opt/node22/bin/node
  [node24]=/opt/nvm/versions/node/v24.21.0/bin/node
)
# variant=flags ; пустые флаги = default. Порядок важен для отчёта.
# always-turbofan-min0: на V8 12.4/13.6 --always-turbofan сам по себе ничего не компилирует (см. RESULTS-TIERS.md),
# синхронную компиляцию на первом вызове возвращает --minimum-invocations-before-optimization=0 (на 11.3 флага нет).
declare -A VARIANTS=(
  [node20]="default= always-turbofan=--always-turbofan always-sparkplug=--always-sparkplug no-sparkplug=--no-sparkplug no-opt=--no-turbofan jitless=--jitless lite-mode=--lite-mode eager=--interrupt-budget=1000"
  [node22]="default= always-turbofan=--always-turbofan always-turbofan-min0=--always-turbofan,--minimum-invocations-before-optimization=0 always-sparkplug=--always-sparkplug no-sparkplug=--no-sparkplug no-opt=--no-turbofan,--no-maglev maglev=--maglev jitless=--jitless lite-mode=--lite-mode eager=--invocation-count-for-turbofan=100,--invocation-count-for-maglev=20"
  [node24]="default= always-turbofan=--always-turbofan always-turbofan-min0=--always-turbofan,--minimum-invocations-before-optimization=0 always-sparkplug=--always-sparkplug no-sparkplug=--no-sparkplug no-opt=--no-turbofan,--no-maglev no-maglev=--no-maglev jitless=--jitless lite-mode=--lite-mode eager=--invocation-count-for-turbofan=100,--invocation-count-for-maglev=20 turbolev=--turbolev"
)
REPS=${REPS:-10}
export N_COLD=${N_COLD:-2000} HOT_MS=${HOT_MS:-1500} UNSTABLE_N=${UNSTABLE_N:-200000}
mkdir -p artifacts/trace-counts artifacts/trace-full
: > raw-runs.jsonl
: > traces.jsonl
TMP=$(mktemp)
echo "params: N_COLD=$N_COLD HOT_MS=$HOT_MS UNSTABLE_N=$UNSTABLE_N REPS=$REPS"
T0=$(date +%s)
for rt in node20 node22 node24; do
  bin=${RT[$rt]}
  for spec in ${VARIANTS[$rt]}; do
    v=${spec%%=*}; flags=${spec#*=}; flags=${flags//,/ }
    for rep in $(seq 1 "$REPS"); do
      VARIANT=$v "$bin" $flags --trace-deopt always-turbofan-bench.js > "$TMP" 2>&1; rc=$?
      line=$(grep '^{' "$TMP" | tail -1)
      if [ $rc -eq 0 ] && [ -n "$line" ]; then
        deo=$(grep -c 'bailout (kind' "$TMP")
        deoH=$(grep 'bailout (kind' "$TMP" | grep -cE 'JSFunction (chunk|hotPhase|coldPhase|unstablePhase) ')
        deoHot=$(grep 'bailout (kind' "$TMP" | grep -cE 'JSFunction (chunk|hotPhase) ')
        printf '{"runtime":"%s","variant":"%s","rep":%s,"data":{"deoptsRep":%s,"deoptsHarnessRep":%s,"deoptsHotHarnessRep":%s,%s}\n' \
          "$rt" "$v" "$rep" "$deo" "$deoH" "$deoHot" "${line#\{}" >> raw-runs.jsonl
      else
        err=$(grep -v '^{' "$TMP" | head -c 300 | tr '\n"' '  ')
        printf '{"runtime":"%s","variant":"%s","rep":%s,"data":{"error":"exit %s: %s"}}\n' "$rt" "$v" "$rep" "$rc" "$err" >> raw-runs.jsonl
      fi
    done
    # trace-прогон: счётчики компиляций и деоптов (один процесс, результат по времени не используется)
    tf=artifacts/trace-counts/$rt-$v.txt
    full=artifacts/trace-full/$rt-$v.txt
    VARIANT=$v "$bin" $flags --trace-opt --trace-deopt always-turbofan-bench.js > "$full" 2>&1; trc=$?
    mag=$(grep -c 'completed compiling.*target MAGLEV' "$full")
    tfc=$(grep -ci 'completed compiling.*target TURBOFAN' "$full")
    deo=$(grep -c 'bailout (kind' "$full")
    mark=$(grep -c '^\[marking' "$full")
    markHot=$(grep '^\[marking' "$full" | grep -cE 'JSFunction (hotA|hotB|hotC) ')
    alw=$(grep -c 'because --always-turbofan' "$full")
    { echo "# $rt $v flags='$flags' exit=$trc  lines=$(wc -l < "$full")  (полный лог: $full)"
      echo "# completed MAGLEV=$mag TURBOFAN=$tfc marking=$mark marking-hotABC=$markHot because-always-turbofan=$alw bailouts=$deo"
      echo "# bailout reasons (reason @ function):"; grep -oE 'reason: .*\): begin\. deoptimizing [^ ]* <JSFunction [^ ]*' "$full" | sed -E 's/\): begin\. deoptimizing [^ ]* </ @ /' | sort | uniq -c | sort -rn | sed 's/^/  /'
      echo "# первые 12 строк с hot/unstable/chunk/anonymous:"; grep -E 'hotA|hotB|hotC|chunk|unstable|anonymous' "$full" | head -12 | cut -c1-220
      echo "# bailout-строки (первые 8):"; grep 'bailout (kind' "$full" | head -8 | cut -c1-220
    } > "$tf"
    printf '{"runtime":"%s","variant":"%s","maglevCompiles":%s,"turbofanCompiles":%s,"markings":%s,"markingsHotABC":%s,"alwaysTurbofanLines":%s,"deopts":%s,"traceExit":%s}\n' \
      "$rt" "$v" "$mag" "$tfc" "$mark" "$markHot" "$alw" "$deo" "$trc" >> traces.jsonl
    echo "done: $rt $v  (+$(( $(date +%s) - T0 ))s)"
  done
done
rm -f "$TMP"
${RT[node24]} collect.js
echo "TIERS_MATRIX_DONE in $(( $(date +%s) - T0 ))s"
