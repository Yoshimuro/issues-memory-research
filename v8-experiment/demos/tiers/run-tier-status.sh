#!/usr/bin/env bash
# Прогон tier-status.js на всех рантаймах/флагах -> artifacts/tier-status-<runtime>.txt
set -uo pipefail
cd "$(dirname "$0")"
run() { # name, bin, flags...
  local name=$1 bin=$2; shift 2
  echo "== $name: $bin $* tier-status.js"
  "$bin" "$@" tier-status.js > "artifacts/tier-status-$name.txt" 2>&1
  echo "   exit=$?"
}
run node20 /opt/node20/bin/node --allow-natives-syntax
run node21 /opt/node21/bin/node --allow-natives-syntax
run node22 /opt/node22/bin/node --allow-natives-syntax
run node22-maglev /opt/node22/bin/node --allow-natives-syntax --maglev
run node24 /opt/nvm/versions/node/v24.21.0/bin/node --allow-natives-syntax
run node24-no-maglev /opt/nvm/versions/node/v24.21.0/bin/node --allow-natives-syntax --no-maglev
run node24-always-sparkplug /opt/nvm/versions/node/v24.21.0/bin/node --allow-natives-syntax --always-sparkplug
# Проверка способа (b): флаг включается в рантайме, без --allow-natives-syntax в командной строке
for rt in node20:/opt/node20/bin/node node21:/opt/node21/bin/node node22:/opt/node22/bin/node node24:/opt/nvm/versions/node/v24.21.0/bin/node; do
  n=${rt%%:*}; b=${rt#*:}
  echo "== $n runtime-flag method (b):"; "$b" tier-status.js 2>&1 | sed -n '2p;12,14p;23p'
done > artifacts/natives-runtime-method.txt 2>&1
