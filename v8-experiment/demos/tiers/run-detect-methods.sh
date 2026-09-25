#!/usr/bin/env bash
# Способы узнать тир БЕЗ natives: --prof, --log-function-events, trace events, --cpu-prof.
# Всё на node24; результаты в artifacts/detect-*.txt
set -uo pipefail
cd "$(dirname "$0")"
N24=/opt/nvm/versions/node/v24.21.0/bin/node
N22=/opt/node22/bin/node
TMP=$(mktemp -d)
A=artifacts

# 1) --prof + --prof-process
( cd "$TMP" && "$N24" --prof "$OLDPWD/detect-workload.js" >/dev/null && "$N24" --prof-process --preprocess isolate*.log > prof.json 2>/dev/null; "$N24" --prof-process isolate*.log > prof.txt 2>/dev/null )
{
  echo "# node24 --prof ; node --prof-process isolate*.log  (полный вывод: detect-prof-full.txt)"
  echo "# строки с нашими функциями (префикс перед именем = тир):"
  sed -n '/\[JavaScript\]/,/^$/p' "$TMP/prof.txt" | sed 's/^/  /'
  echo
  echo "# легенда из самого prof-process (если печатает):"
  grep -niE 'optimized|interpret|baseline|maglev|sparkplug' "$TMP/prof.txt" | grep -v tierProbe | head -20 | sed 's/^/  /'
} > $A/detect-prof.txt
cp "$TMP/prof.txt" $A/detect-prof-full.txt
# контрольный прогон, где верхний тир = Sparkplug (--no-maglev --no-turbofan): виден ли префикс '^' в тиках
( cd "$TMP" && rm -f isolate*.log && "$N24" --prof --no-maglev --no-turbofan "$OLDPWD/detect-workload.js" >/dev/null && "$N24" --prof-process isolate*.log > prof2.txt 2>/dev/null )
{ echo; echo "# контроль: node24 --prof --no-maglev --no-turbofan (только Ignition+Sparkplug):"; sed -n '/\[JavaScript\]/,/^$/p' "$TMP/prof2.txt" | head -14 | sed 's/^/  /'; } >> $A/detect-prof.txt
( cd "$TMP" && rm -f isolate*.log && "$N24" --prof "$OLDPWD/detect-workload.js" >/dev/null )
# префиксы в JS-секции: собрать все различающиеся первые символы имён функций
echo "# все префиксы имён в секции [JavaScript]:" >> $A/detect-prof.txt
awk '/\[JavaScript\]/{f=1;next} /^ *\[/{f=0} f && NF>=4 {print $4}' "$TMP/prof.txt" | grep -oE '^[^A-Za-z(]+' | sort | uniq -c | sed 's/^/  /' >> $A/detect-prof.txt
# сырой isolate-лог: строки code-creation для наших функций (тир виден в поле kind/имени)
echo "# сырой isolate*.log: code-creation,JS,... для tierProbe0 (поле после адреса/размера — имя с префиксом тира):" >> $A/detect-prof.txt
grep -E '^code-creation,JS' "$TMP"/isolate*.log | grep 'tierProbe0' | cut -d, -f1-6 | sed 's/^/  /' >> $A/detect-prof.txt
echo "# code-creation с --log-code, все kinds для tierProbe0:" >> $A/detect-prof.txt

# 2) --log-function-events
( cd "$TMP" && "$N24" --log-function-events --no-logfile-per-isolate --logfile=fe.log "$OLDPWD/detect-workload.js" >/dev/null )
{
  echo "# node24 --log-function-events --no-logfile-per-isolate --logfile=fe.log ; grep tierProbe fe.log"
  echo "# уникальные (event-type) в логе:"
  awk -F, '/^function,/{print $2}' "$TMP/fe.log" | sort | uniq -c | sort -rn | sed 's/^/  /'
  echo "# все строки про tierProbeAlpha/Beta:"
  grep -E 'tierProbe(Alpha|Beta)' "$TMP/fe.log" | sed 's/^/  /'
  echo "# все строки про tierProbe0 (первое поле = событие, второе = тип):"
  grep -E 'tierProbe0' "$TMP/fe.log" | sed 's/^/  /'
  echo "# первые 5 строк лога (формат):"
  head -5 "$TMP/fe.log" | sed 's/^/  /'
} > $A/detect-log-function-events.txt

# 2b) то же плюс --log-code (code-creation events содержат тир кода?)
( cd "$TMP" && "$N24" --log-function-events --log-code --no-logfile-per-isolate --logfile=fc.log "$OLDPWD/detect-workload.js" >/dev/null )
{
  echo "# node24 --log-function-events --log-code --no-logfile-per-isolate --logfile=fc.log ; grep tierProbe"
  grep -E 'tierProbe0' "$TMP/fc.log" | cut -c1-200 | sed 's/^/  /'
  echo "# уникальные типы событий / code kinds:"
  awk -F, '{print $1","$2}' "$TMP/fc.log" | sort | uniq -c | sort -rn | head -30 | sed 's/^/  /'
} > $A/detect-log-code.txt

# 3) trace events
( cd "$TMP" && "$N24" --trace-event-categories v8,v8.compile --trace-event-file-pattern=te.json "$OLDPWD/detect-workload.js" >/dev/null )
{
  echo "# node24 --trace-event-categories v8,v8.compile --trace-event-file-pattern=te.json"
  echo "# уникальные имена событий:"
  grep -oE '"name":"[^"]+"' "$TMP/te.json" | sort | uniq -c | sort -rn | head -60 | sed 's/^/  /'
  echo "# события с Optimize/Maglev/Turbofan/Baseline/Sparkplug в имени или аргументах:"
  grep -oE '\{[^{}]*(Optimiz|Maglev|Turbofan|TurboFan|Baseline|Sparkplug)[^{}]*\}' "$TMP/te.json" | head -20 | sed 's/^/  /'
  echo "# события, где упомянуты наши функции:"
  grep -oE '\{[^{}]*tierProbe[^{}]*\}' "$TMP/te.json" | head -20 | sed 's/^/  /'
} > $A/detect-trace-events.txt
( cd "$TMP" && "$N24" --trace-event-categories 'disabled-by-default-v8.compile,v8.compile,disabled-by-default-v8.runtime_stats' --trace-event-file-pattern=te2.json "$OLDPWD/detect-workload.js" >/dev/null )
{
  echo "# node24 --trace-event-categories disabled-by-default-v8.compile,v8.compile,disabled-by-default-v8.runtime_stats"
  echo "# уникальные имена событий:"
  grep -oE '"name":"[^"]+"' "$TMP/te2.json" | sort | uniq -c | sort -rn | head -60 | sed 's/^/  /'
  echo "# события с tierProbe:"
  grep -oE '\{[^{}]*tierProbe[^{}]*\}' "$TMP/te2.json" | head -20 | sed 's/^/  /'
  echo "# примеры событий (что в args): V8.OptimizeCode / V8.MaglevTask / V8.CompileCode / V8.FinalizeBaselineConcurrentCompilation:"
  for nm in V8.OptimizeCode V8.MaglevTask V8.CompileCode V8.FinalizeBaselineConcurrentCompilation V8.MarkCandidatesForOptimization; do
    grep -oE '\{[^{}]*"name":"'$nm'"[^{}]*(\{[^{}]*\}[^{}]*)*\}' "$TMP/te2.json" | head -1 | sed 's/^/  /'
  done
} >> $A/detect-trace-events.txt

# 4) --cpu-prof
( cd "$TMP" && "$N24" --cpu-prof --cpu-prof-name=cpu.cpuprofile "$OLDPWD/detect-workload.js" >/dev/null )
{
  echo "# node24 --cpu-prof --cpu-prof-name=cpu.cpuprofile"
  "$N24" -e '
    const p = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
    console.log("# top-level keys:", Object.keys(p).join(", "));
    const n = p.nodes.find(n => n.callFrame.functionName === "tierProbeAlpha") || p.nodes[3];
    console.log("# node keys:", Object.keys(n).join(", "));
    console.log("# callFrame keys:", Object.keys(n.callFrame).join(", "));
    console.log("# sample node:", JSON.stringify(n));
    const s = JSON.stringify(p);
    console.log("# упоминания tier-слов в файле: optimiz=", (s.match(/optimiz/gi)||[]).length, " maglev=", (s.match(/maglev/gi)||[]).length, " turbofan=", (s.match(/turbofan/gi)||[]).length, " baseline=", (s.match(/baseline/gi)||[]).length, " sparkplug=", (s.match(/sparkplug/gi)||[]).length, " interpret=", (s.match(/interpret/gi)||[]).length);
  ' "$TMP/cpu.cpuprofile"
} > $A/detect-cpu-prof.txt

# 5) --trace-opt/--trace-deopt на той же нагрузке (для сравнения, node22 и node24)
"$N24" --trace-opt --trace-deopt detect-workload.js 2>&1 | grep tierProbe > $A/detect-trace-opt-node24.txt
"$N22" --trace-opt --trace-deopt detect-workload.js 2>&1 | grep tierProbe > $A/detect-trace-opt-node22.txt
rm -rf "$TMP"
echo DETECT_DONE
