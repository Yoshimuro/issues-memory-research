#!/usr/bin/env bash
# Стретч: три инстанса (последовательно!) под три варианта, autocannon на каждый.
# Вариант за вариантом: поднять сервер -> прогреть -> autocannon -> убить.
set -euo pipefail
export PATH=/opt/node24-local/bin:$PATH
cd "$(dirname "$0")"

: > http-results.txt
for v in mono-llm guard-llm mixed-mono; do
  echo "=== $v ===" | tee -a http-results.txt
  VARIANT=$v PORT=3000 node server.js & SRV=$!
  sleep 1.5
  # прогрев: 500 запросов последовательно
  node -e '
    const http=require("http");let n=0;
    (function go(){http.get("http://127.0.0.1:3000/process?batch=1000",res=>{res.resume();res.on("end",()=>{if(++n<500)go();else process.exit(0)})})})();'
  npx autocannon -c 50 -d 20 --json "http://127.0.0.1:3000/process?batch=1000" \
    | node -e '
      let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
        const j=JSON.parse(s);
        console.log(JSON.stringify({
          variant: process.env.V,
          rps_avg: j.requests.average, rps_p50: j.requests.p50 ?? null,
          lat_p50_ms: j.latency.p50, lat_p99_ms: j.latency.p99,
          throughput_mb_s: +(j.throughput.average/1048576).toFixed(1),
          errors: j.errors, non2xx: j.non2xx
        }));
      })' V=$v | tee -a http-results.txt
  kill $SRV; wait $SRV 2>/dev/null || true
  sleep 1
done
echo "HTTP_DONE" | tee -a http-results.txt
