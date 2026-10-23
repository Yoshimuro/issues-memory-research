#!/bin/bash
# Сквозная перепроверка чисел доклада в ОДНОМ окружении. Строго последовательно.
# Запуск внутри контейнера: bash docker/verify.sh <outdir> [myths-only]
set -uo pipefail
cd /work; OUT=docker/out/$1; mkdir -p $OUT; MODE=${2:-all}
{ node -p '"node "+process.version+" v8 "+process.versions.v8+" "+process.platform+"/"+process.arch'; echo "alpine $(cat /etc/alpine-release 2>/dev/null || echo -)"; echo "cpus=$(nproc)"; date -u +%FT%TZ; } | tee $OUT/env.txt

myths() {
  : > $OUT/myths-raw.jsonl
  declare -A CASES=([ic-mono-mega]="1 2 4 8" [elements-kinds]="SMI DOUBLE HOLEY ELEMENTS" [delete-dict]="fast delete undefined" [trycatch-myth]="naive-pair honest-plain honest-try")
  for b in ic-mono-mega elements-kinds delete-dict trycatch-myth; do for c in ${CASES[$b]}; do for rep in 1 2 3 4 5; do
    tmp=$(mktemp --suffix=.js); printf "globalThis.CASE='%s';\n" "$c" > $tmp; cat demos/myths/$b.js >> $tmp
    node --allow-natives-syntax $tmp 2>/dev/null | grep '^{' | while read -r l; do printf '{"rep":%s,"data":%s}\n' $rep "$l" >> $OUT/myths-raw.jsonl; done; rm -f $tmp
  done; echo "myths $b/$c done"; done; done
}
if [ "$MODE" = myths-only ]; then myths; echo VERIFY_DONE; exit 0; fi

echo "## 1. генерации агента через прибор"; : > $OUT/candidates.jsonl
for d in p1-no-rules p2-no-rules p1-rules p2-rules; do for f in lab/out/$d/candidate_*.js; do
  printf '{"branch":"%s","file":"%s","r":%s}\n' $d $(basename $f) "$(node --allow-natives-syntax lab/shape-analyzer.js $f | tail -1)" >> $OUT/candidates.jsonl; done; done
echo "## 2. прибор на ref-a/ref-b ×5"; : > $OUT/refs.jsonl
for k in 1 2 3 4 5; do for f in ref-a ref-b; do printf '{"f":"%s","r":%s}\n' $f "$(node --allow-natives-syntax lab/shape-analyzer.js lab/$f.js)" >> $OUT/refs.jsonl; done; done
echo "## 3. лестница ярусов"; : > $OUT/tiers.jsonl
for k in 1 2 3 4 5; do for n in 0 1 2 3; do printf '{"maxopt":%s,"r":%s}\n' $n "$(node --max-opt=$n docker/tier-bench.js)" >> $OUT/tiers.jsonl; done; done
echo "## 4. мифы"; myths
[ -f lab/real/dataset.ndjson ] || (cd lab/real && node gen-dataset.js)
echo "## 5. пайплайн 90 ячеек"; : > $OUT/pipeline.jsonl
for v in mono-llm guard-llm mixed-mono ref-a ref-b; do [ -f lab/real/variants/$v.js ] || cp lab/$v.js lab/real/variants/$v.js; done
for v in mono-llm guard-llm mixed-mono ref-a ref-b; do for b in 500 5000; do for r in 1 5 20; do for rep in 1 2 3 4 5; do
  (cd lab/real && VARIANT=$v BATCH=$b R=$r REP=$rep node pipeline.js) >> $OUT/pipeline.jsonl; done; done; done; echo "pipeline $v done"; done
rm -f lab/real/variants/ref-a.js lab/real/variants/ref-b.js
echo "## 6. HTTP"; : > $OUT/http.jsonl
for v in mono-llm guard-llm mixed-mono; do
  (cd lab/real && VARIANT=$v PORT=3000 node server.js) & SRV=$!; sleep 2
  node -e 'const http=require("http");let n=0;(function go(){http.get("http://127.0.0.1:3000/process?batch=1000",res=>{res.resume();res.on("end",()=>{if(++n<500)go();else process.exit(0)})})})();'
  autocannon -c 50 -d 20 --json "http://127.0.0.1:3000/process?batch=1000" 2>/dev/null | V=$v node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);console.log(JSON.stringify({variant:process.env.V,rps_avg:j.requests.average,lat_p50_ms:j.latency.p50,lat_p99_ms:j.latency.p99,errors:j.errors,non2xx:j.non2xx}))})' >> $OUT/http.jsonl
  kill $SRV; wait $SRV 2>/dev/null; sleep 1; echo "http $v done"; done
echo "## 7. ярусы по вызовам ×5"; : > $OUT/tier-threshold.jsonl
for k in 1 2 3 4 5; do node --allow-natives-syntax docker/tier-threshold.js 2>&1 | tail -1 >> $OUT/tier-threshold.jsonl; done
echo "## 8. A/B под --turbolev ×5 (на V8 без флага — ошибка, это ожидаемо)"; : > $OUT/turbolev.jsonl
for k in 1 2 3 4 5; do for f in ref-a ref-b; do printf '{"f":"%s","r":%s}\n' $f "$(node --allow-natives-syntax --turbolev lab/shape-analyzer.js lab/$f.js 2>/dev/null | tail -1 | grep '^{' || echo '{"error":"no --turbolev"}')" >> $OUT/turbolev.jsonl; done; done
echo "## 9. wrong map у читателя ×5"; : > $OUT/wrongmap.txt
for k in 1 2 3 4 5; do for f in ref-a ref-b; do node --allow-natives-syntax --trace-deopt lab/demo-wrongmap.js lab/$f.js 2>&1 | grep 'wrong map' | sed -E "s/.*<JSFunction ([^ >]*).*<Code ([A-Z_]*)>.*/$f \1 \2/" >> $OUT/wrongmap.txt; done; done
for f in ref-a ref-b; do node --allow-natives-syntax --trace-deopt lab/shape-analyzer.js lab/$f.js 2>&1 | grep 'wrong map' | sed -E "s/.*<JSFunction ([^ >]*).*/analyzer-$f \1/" >> $OUT/wrongmap.txt; done
echo "## 10. статус читателя, log-ic, samemap"
for f in ref-a ref-b; do node --allow-natives-syntax docker/shape-analyzer-status.js lab/$f.js 2>&1 | head -1 | sed "s/^/$f /"; done > $OUT/reader-status.txt
for f in ref-a ref-b; do node --allow-natives-syntax --log-ic --no-logfile-per-isolate --logfile=$OUT/ic-$f.log lab/shape-analyzer.js lab/$f.js >/dev/null 2>&1; done
node --allow-natives-syntax lab/demo-samemap.js > $OUT/samemap.txt 2>&1
echo VERIFY_DONE
