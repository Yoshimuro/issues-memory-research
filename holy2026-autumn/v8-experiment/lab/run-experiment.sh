#!/usr/bin/env bash
# usage: ./run-experiment.sh -n 15 -p prompts/P1.txt -o out/no-rules [-r v8-rules.md] [-m opus]
set -uo pipefail
N=10; PROMPT_FILE=""; OUT=""; RULES=""; MODEL=""
while getopts "n:p:o:r:m:" f; do case $f in
  n) N=$OPTARG;; p) PROMPT_FILE=$OPTARG;; o) OUT=$OPTARG;; r) RULES=$OPTARG;; m) MODEL=$OPTARG;;
esac; done
[ -z "$PROMPT_FILE" ] || [ -z "$OUT" ] && { echo "usage: -n N -p prompt.txt -o outdir [-r rules.md] [-m model]"; exit 1; }

d=$PWD; while [ "$d" != "/" ]; do
  [ -f "$d/CLAUDE.md" ] && { echo "ОШИБКА: найден $d/CLAUDE.md — загрязнит ветку без правил"; exit 1; }
  d=$(dirname "$d")
done

mkdir -p "$OUT"; : > "$OUT/results.jsonl"
PROMPT=$(cat "$PROMPT_FILE")
[ -n "$RULES" ] && PROMPT="Правила кодогенерации проекта (обязательны к применению):
$(cat "$RULES")

---
$PROMPT"
MFLAG=(); [ -n "$MODEL" ] && MFLAG=(--model "$MODEL")

for i in $(seq 1 "$N"); do
  claude -p "$PROMPT" --output-format text "${MFLAG[@]}" > "$OUT/raw_$i.txt" 2>"$OUT/err_$i.log"
  awk '/^```/{if(f){exit} f=1; next} f' "$OUT/raw_$i.txt" > "$OUT/candidate_$i.js"
  [ -s "$OUT/candidate_$i.js" ] || cp "$OUT/raw_$i.txt" "$OUT/candidate_$i.js"
  RAW=$(node --allow-natives-syntax --trace-deopt shape-analyzer.js "$OUT/candidate_$i.js" 2>/dev/null)
  DEOPTS=$(printf '%s\n' "$RAW" | grep -c 'bailout' || true)
  R=$(printf '%s\n' "$RAW" | tail -1)
  echo "$R" | node -e "
    let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{
      let j; try{j=JSON.parse(s)}catch{j={error:'no json'}}
      j.run=$i; j.deopts=$DEOPTS;
      console.log(JSON.stringify(j));
    })" >> "$OUT/results.jsonl"
  echo "run $i: $(tail -1 "$OUT/results.jsonl")"
done
node report.js "$OUT/results.jsonl"
