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
# Проверка способа (b): флаг включается в рантайме, без --allow-natives-syntax в командной строке.
# Полный вывод — artifacts/tier-status-<runtime>-runtime-flag.txt; краткая сводка — natives-runtime-method.txt.
for rt in node20:/opt/node20/bin/node node21:/opt/node21/bin/node node22:/opt/node22/bin/node node24:/opt/nvm/versions/node/v24.21.0/bin/node; do
  n=${rt%%:*}; b=${rt#*:}
  "$b" tier-status.js > "artifacts/tier-status-$n-runtime-flag.txt" 2>&1
  echo "== $n runtime-flag method (b) (полный вывод: artifacts/tier-status-$n-runtime-flag.txt):"
  sed -n '1,2p;12,14p;23p' "artifacts/tier-status-$n-runtime-flag.txt"
done > artifacts/natives-runtime-method.txt 2>&1
# Собран ли Maglev в этой сборке Node (v8_enable_maglev) и что говорит %OptimizeMaglevOnNextCall
for rt in node20:/opt/node20/bin/node node21:/opt/node21/bin/node node22:/opt/node22/bin/node node24:/opt/nvm/versions/node/v24.21.0/bin/node; do
  n=${rt%%:*}; b=${rt#*:}
  echo "== $n: v8_enable_maglev=$("$b" -p process.config.variables.v8_enable_maglev); --v8-options: $("$b" --v8-options | grep -A1 '^  --maglev ' | tr -s ' \n' ' ')"
  "$b" --allow-natives-syntax --maglev -e '
    function f(o){return o.a+o.b} const o={a:1,b:2};
    %PrepareFunctionForOptimization(f); f(o); f(o);
    %OptimizeMaglevOnNextCall(f); f(o);
    const s=%GetOptimizationStatus(f); console.log("   after %%OptimizeMaglevOnNextCall + call: status", s, require("./tier-status").decodeOptimizationStatus(s).join("|"));' 2>&1 | sed 's/^/   /'
done > artifacts/maglev-build.txt 2>&1
