# Тиры V8: как узнать, в каком компиляторе живёт функция, и почему не «всегда TurboFan»

**Дата:** 2026-09-25. **Вопросы доклада:** (Q1) как убедиться, что вызван тот или иной компилятор; (Q2) почему бы не компилировать всё сразу TurboFan'ом — «потратить мс на старте, получить буст потом».

## Рантаймы

| runtime | версия | V8 | примечание |
|---|---|---|---|
| node20 | v20.20.2 | 11.3.244.8 | Maglev нет (флаг `--maglev` принимается, но Maglev-компиляций не наблюдается) |
| node21 | v21.7.3 | 11.8.172.17 | только для tier-status (прогрессия тиров) |
| node22 | v22.22.2 | 12.4.254.21 | Maglev есть, по умолчанию выключен; с `--maglev` Maglev-компиляций в матрице **не наблюдалось** (0 строк `target MAGLEV`) |
| node24 | v24.21.0 | 13.6.233.17 | Maglev включён по умолчанию; есть экспериментальный `--turbolev` |

Машина: 4 vCPU Intel Xeon 2.10 GHz, 16 GB. Все процессы строго последовательно. Точные версии — `artifacts/versions.txt`; какие флаги какая версия принимает — `artifacts/flag-support.txt`.

## Методология

- **Q1 (детекция тира).** `tier-status.js` — библиотека `decodeOptimizationStatus(status)` / `tierOf(status)` / `frameTierOf(status)` по битам enum `OptimizationStatus` из `src/runtime/runtime.h` (биты 0..23) + CLI. CLI берёт горячую функцию `hot(o) { return o.a * o.b + o.c - o.d + o.e; }` (одна форма объекта), вызывает её в цикле и печатает декодированный `%GetOptimizationStatus` после вызовов №1, 2, 7, 8, 9, 50, 100, 200, 399, 400, 401, 600, 1000, 2000, 2999, 3000, 3001, 4000, 6000, 10000, 20000, затем после 5 и 20 тиков `setImmediate` и после `setTimeout` 20/100/300 мс (чтобы фоновая компиляция успела установиться). Плюс функция, вызванная один раз, и функция с длинным циклом (OSR), статус которой запрашивается изнутри цикла. Прогнано на 7 конфигурациях: node20, node21, node22, node22 `--maglev`, node24, node24 `--no-maglev`, node24 `--always-sparkplug` (`run-tier-status.sh` → `artifacts/tier-status-<runtime>.txt`).
- Два способа включить natives: (a) `--allow-natives-syntax` в командной строке; (b) в рантайме `require('v8').setFlagsFromString('--allow-natives-syntax')` и затем `new Function('f', 'return %GetOptimizationStatus(f)')`. **Способ (b) проверен и работает на node20, node21, node22, node24** (`artifacts/natives-runtime-method.txt`: во всех четырёх «natives через: b:runtime v8.setFlagsFromString + new Function», таблица тиров печатается). Важно: флаг действует только на код, распарсенный после его установки, поэтому `%`-вызов нужно создавать через `new Function`/`eval`.
- `trace-demo.js` — что печатают `--trace-opt --trace-deopt --trace-baseline` (node22, node24), включая деопт по смене формы (`artifacts/trace-opt-<runtime>.txt`).
- «Продакшн»-детекция без natives (`run-detect-methods.sh`, node24, нагрузка `detect-workload.js`: 8 функций `tierProbe0..7` через мегаморфный call-site, чтобы не заинлайнились): `--prof` + `--prof-process`, `--log-function-events` (+ `--log-code`), `--trace-event-categories`, `--cpu-prof`. Результаты — `artifacts/detect-*.txt`.
- **Q2 (матрица).** `always-turbofan-bench.js`: один процесс = один вариант флагов, три фазы, у каждой своя функция-цикл (общий `bench(fn)` не используется — см. заражение харнесса в `demos/myths`):
  - *cold* — N_COLD=2000 разных функций через `new Function` (индекс вшит в тело → отдельные SharedFunctionInfo), каждая вызвана ровно 3 раза; отдельно время создания и время вызовов;
  - *hot* — 3 моно-функции (`hotA/hotB/hotC`) в цикле HOT_MS=1500 мс, пропускная способность по окнам 25 мс: пик = медиана 5 лучших окон, «время до 90% пика» = конец первого окна с ≥0.9·пик, первое окно;
  - *unstable* — одна функция `unstable(o)` (цикл на 6 итераций по трём полям): 20000 вызовов с формой A `{p,q,r}`, 20000 с формой B `{p,q,r,extra}`, 20000 вперемешку; UNSTABLE_N=20000 (как в задании; это 1–5 мс на фазу, поэтому цифры unstable сравниваются только грубо);
  - в конце `process.memoryUsage().rss`, `heapUsed`, `v8.getHeapCodeStatistics().code_and_metadata_size`.
  - Варианты: `default`, `--always-turbofan`, `--always-sparkplug`, `--no-sparkplug`, `no-opt` (`--no-turbofan`, на node22/24 плюс `--no-maglev`), `--maglev` (node22), `--no-maglev` (node24), `--jitless`, `--lite-mode`, `eager` (node20: `--interrupt-budget=1000`; node22/24: `--invocation-count-for-turbofan=100 --invocation-count-for-maglev=20` — `--interrupt-budget` на node22/24 отвергается, `--invocation-count-for-turbofan` на node20 отвергается), `--turbolev` (node24). `--jitless`/`--lite-mode` на node20/22 печатают `Warning: disabling flag --expose_wasm due to conflicting flags`, но работают.
  - 3 рантайма × 8–10 вариантов × 5 повторов = 135 процессов, медианы → `results.jsonl`, сырые → `raw-runs.jsonl`. Плюс один trace-прогон на ячейку (`--trace-opt --trace-deopt` в файл) → счётчики `completed compiling (target MAGLEV/TURBOFAN)` и `bailout` → `traces.jsonl`, выжимки в `artifacts/trace-counts/`. Полная матрица: **274 с**.
  - Первый полный прогон показал, что сам цикл hot-фазы деоптимизировался (переполнение Smi у аккумулятора + первое `push` в массив окон); харнесс поправлен (аккумулятор сразу double, массив окон прогрет), матрица прогнана заново — в документе только второй прогон.
- **Механизм (Q2).** `feedback-matters.js`: одна и та же функция `target(o, arr, i)` компилируется оптимизирующим компилятором (a) сразу, с пустым feedback (`%PrepareFunctionForOptimization` + `%OptimizeFunctionOnNextCall`, 0 прогревочных вызовов) и (b) после 200 прогревочных вызовов на стабильной форме. Потом 2000 и 1e6 вызовов; статус-биты, строки `--trace-deopt` (дочерний процесс), пропускная способность. TurboFan на node22/node24, Maglev на node24 (`%OptimizeMaglevOnNextCall` есть и работает).

Команды: `./run-tier-status.sh`, `node22 --trace-opt --trace-deopt --trace-baseline trace-demo.js`, `./run-detect-methods.sh`, `./run-matrix.sh` (→ `collect.js` → `results.jsonl`), `node report-tiers.js` (→ таблицы ниже, копия в `artifacts/report-tiers.md`), `node22 feedback-matters.js turbofan`, `node24 feedback-matters.js`. Все скрипты — CommonJS (`package.json` с `"type":"commonjs"` в этой папке, потому что корень репозитория — ESM).

## Q1. Как узнать, какой тир выполняет функцию

### Таблица способов

| способ | работает на | что печатает (реальная строка из артефактов) | тир виден? |
|---|---|---|---|
| natives: `%GetOptimizationStatus(f)` (флаг с командной строки или `v8.setFlagsFromString` + `new Function`) | node20/21/22/24 (оба способа) | `49 → IsFunction\|Optimized\|MaglevOptimized`; `81 → IsFunction\|Optimized\|TurboFanned`; `32769 → IsFunction\|Baseline`; `129 → IsFunction\|Interpreted`; `262145 → IsFunction\|IsLazy`; изнутри цикла `6145 → IsFunction\|IsExecuting\|TopmostFrameIsTurboFanned` | да, точно, включая «помечена / компилируется в фоне» и тир верхнего кадра (OSR) |
| `--trace-opt` | node20/22/24 | `[marking 0x… <JSFunction hotMono …> for optimization to MAGLEV, ConcurrencyMode::kConcurrent, reason: hot and stable]`, `[completed compiling 0x… <JSFunction hotMono …> (target TURBOFAN_JS) - took 0.012, 0.954, 0.045 ms]` (node22: `target TURBOFAN`; с `--always-turbofan`: `[optimizing … (target TURBOFAN) because --always-turbofan]`) | да, только события компиляции (не «текущее состояние») |
| `--trace-deopt` | node20/22/24 | `[bailout (kind: deopt-eager, reason: wrong map): begin. deoptimizing 0x… <JSFunction willDeopt …>, 0x… <Code MAGLEV>, opt id 5, bytecode offset 0, …]` | да, в деопте виден тир кода (`<Code MAGLEV>` / `<Code TURBOFAN>`) |
| `--trace-baseline` | node20/21: `[compiling method 0x… <SharedFunctionInfo hotMono> (target BASELINE)]`, `[completed compiling … (target BASELINE) - took 0.005 ms]`; node22/24: только `[Baseline batch compilation] Enqueued SFI hotMono with estimated size 259 (current budget: 259/4096)` | см. слева | частично: на node22/24 видна только постановка в batch-очередь |
| `--prof` + `--prof-process` | node24 (проверено) | `JS: *tierProbe7 …:13:20` (TurboFan), `JS: +driver …:16:16` (Maglev), `JS: ~tierProbe4 …:10:20` (Ignition), `JS: ^tierProbe7 …` (Sparkplug; в контрольном прогоне `--no-maglev --no-turbofan`) | да, по префиксу: `~` Ignition, `^` Sparkplug, `+` Maglev, `*` TurboFan; отдельная строка на каждый тир одной и той же функции |
| `--log-function-events --logfile=… --no-logfile-per-isolate` | node24 (проверено) | `function,interpreter,…,tierProbe0` → `function,first-execution,…` → `function,baseline,…` → `function,first-execution-BASELINE,…` → `function,maglev,…` → `function,first-execution-MAGLEV,…` → `function,turbofan,88,360,443,0.752,25288,tierProbe0` → `function,first-execution-TURBOFAN_JS,…` | да, события компиляции и первого выполнения на каждом тире |
| то же + `--log-code` | node24 | `code-creation,JS,9,…,56,tierProbe0 …:6:20,0x…,~` / `…,452,…,^` / `…,760,…,+'` / `…,700,…,*'` | да: маркер тира последним полем (`~ ^ + *`; у Maglev/TurboFan наблюдается суффикс `'`) + размер кода |
| `--trace-event-categories v8,v8.compile` | node24 | только `V8.DeoptimizeCode`, `MinorGC`, `V8.GCScavenger`… | нет |
| `--trace-event-categories disabled-by-default-v8.compile,…` | node24 | `{"name":"V8.MaglevTask","dur":346,"args":{}}`, `V8.OptimizeCode`, `V8.CompileCode`, `V8.FinalizeBaselineConcurrentCompilation`, `V8.MarkCandidatesForOptimization` — `args` пустые | только факт/длительность компиляций, **без имён функций** |
| `--cpu-prof` (.cpuprofile) | node24 | ключи узла: `id, callFrame, hitCount, children`; `callFrame`: `functionName, scriptId, url, lineNumber, columnNumber`; вхождений `optimiz/maglev/turbofan/baseline/sparkplug/interpret` в файле: 0 | **нет** |
| DevTools Performance/Profiler | не проверялось (нет браузера в этом окружении); формат тот же `.cpuprofile` | — | по формату — нет |

Файл с полными выводами: `artifacts/detect-prof.txt` (+ `detect-prof-full.txt`), `detect-log-function-events.txt`, `detect-log-code.txt`, `detect-trace-events.txt`, `detect-cpu-prof.txt`, `detect-trace-opt-node22.txt`, `detect-trace-opt-node24.txt`.

### Наблюдаемая прогрессия тиров: `hot(o)` (одна форма, ~20 байткодов), статус после N-го вызова

Первый N в таблице, при котором наблюдался тир (из `artifacts/tier-status-*.txt`; `pending` = `OptimizingConcurrently` / `MarkedFor…`, т.е. компиляция идёт в фоне; «+20 мс» — после `setTimeout(20)` и ещё 100 вызовов):

| конфигурация | N=0 | interpreted | baseline | pending (в фоне) | maglev | turbofan | после +20 мс |
|---|---|---|---|---|---|---|---|
| node20 | lazy | 1 | 100 (в прогоне способом (b) — 399) | 2000 (`Baseline\|OptimizingConcurrently`) | — | 20000 | turbofan |
| node21 | lazy | 1 | 600 | 4000 | — | не установился и после 20 000 вызовов + 20×setImmediate | turbofan |
| node22 | lazy | 1 | 600 | 4000 | — | то же | turbofan |
| node22 `--maglev` | lazy | 1 | 600 | 4000 | **нет** (Maglev-бита не появилось) | после 20×setImmediate | turbofan |
| node24 | lazy | 1 | 2999 (Baseline-бит появился уже вместе с `OptimizingConcurrently`) | 600 (`Interpreted\|OptimizingConcurrently` — Maglev компилируется раньше, чем поставился Sparkplug) | 6000 | после +20 мс (20300) | turbofan |
| node24 `--no-maglev` | lazy | 1 | 3001 | 4000 | — | 20000 | turbofan |
| node24 `--always-sparkplug` | lazy | — (вызов №1 уже `Baseline`) | 1 | 600 | 4000 | после +20 мс | turbofan |

Что видно по цифрам:
- Ни в одной конфигурации тир не сменился на «магических» 8/400/3000 вызовах — порог зависит от бюджета прерываний (размер байткода) и от того, успел ли фоновый поток; точка Sparkplug на node20 в двух прогонах была 100 и 399 (batch-компиляция).
- В плотном цикле без пауз фоновая TurboFan-компиляция может не установиться и за 20 000 вызовов (node21/node22); стоило дать 20 мс — везде `turbofan`.
- Функция, вызванная один раз: до вызова `IsLazy`, после — `Interpreted`; с `--always-sparkplug` — сразу `Baseline`.
- OSR (статус изнутри цикла `loopy`, 3e6 итераций): node24 — `i=0: TopmostFrameIsInterpreted` → `i=10000: TopmostFrameIsBaseline|MarkedForConcurrentMaglevOptimization` → `i=500000: TopmostFrameIsTurboFanned` (кадр стал TurboFan, минуя установку Maglev для самой функции); node22 — `Interpreted` → `Baseline` → `TopmostFrameIsTurboFanned` при том, что функция всё ещё `MarkedForConcurrentOptimization`. После выхода из цикла на node24 статус = только `IsFunction` (1), на node22 — `Baseline|MarkedForConcurrentOptimization`. Биты `TopmostFrameIs*` — единственный способ увидеть OSR-тир.

### Что печатает `--trace-opt --trace-deopt --trace-baseline` (`trace-demo.js`)

node24 (`artifacts/trace-opt-node24.txt`): `hotMono` → `Enqueued SFI hotMono` (Sparkplug batch) → `marking … to MAGLEV … reason: hot and stable` → `completed compiling … (target MAGLEV) - took 0.001, 0.157, 0.011 ms` → `marking … to TURBOFAN_JS` → `completed compiling … (target TURBOFAN_JS) - took 0.012, 0.954, 0.045 ms`. Для `willDeopt` после смены формы: `[bailout (kind: deopt-eager, reason: wrong map): begin. deoptimizing … <Code MAGLEV>` и затем повторная пометка `for optimization to MAGLEV`.
node22 (`artifacts/trace-opt-node22.txt`): те же события с `target TURBOFAN` (без Maglev), деопт `<Code TURBOFAN>`, `reason: wrong map`.

## Q2. Почему не «всегда TurboFan»: матрица (медианы 5 процессов; × — ratio к default того же рантайма)


### node20 (N_COLD=2000, HOT_MS=1500, UNSTABLE_N=20000; медианы 5 процессов)

| variant | cold ms | × | hot peak it/ms | × | 1st window it/ms | t90 ms | unstable ms | × | rss MB | code KB | compiles M/TF | deopts |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| default | 36.4 | ×1.00 | 107960 | ×1.00 | 82417 | 150 | 3.21 | ×1.00 | 54.6 | 2901 | 0/11 | 3 |
| always-turbofan | 1839.4 | ×50.49 | 9893 | ×0.09 | 7121 | 50 | 8.87 | ×2.76 | 59.9 | 7491 | 0/4309 | 0 |
| always-sparkplug | 40.2 | ×1.10 | 134135 | ×1.24 | 81111 | 75 | 3.22 | ×1.00 | 55.7 | 3546 | 0/10 | 3 |
| no-sparkplug | 29.3 | ×0.80 | 108767 | ×1.01 | 73411 | 75 | 3.85 | ×1.20 | 52.9 | 1749 | 0/11 | 3 |
| no-opt | 34.9 | ×0.96 | 6446 | ×0.06 | 5669 | 25 | 10.58 | ×3.30 | 49.6 | 2881 | 0/0 | 0 |
| jitless | 28.7 | ×0.79 | 4385 | ×0.04 | 4088 | 25 | 14.90 | ×4.64 | 47.3 | 1727 | 0/0 | 0 |
| lite-mode | 28.0 | ×0.77 | 4387 | ×0.04 | 4157 | 25 | 14.80 | ×4.61 | 45.3 | 1727 | 0/0 | 0 |
| eager | 35.6 | ×0.98 | 108829 | ×1.01 | 82327 | 75 | 3.33 | ×1.04 | 54.8 | 2917 | 0/20 | 4 |

детали cold (create / call) и unstable (A / B / mix), node20:

| variant | cold create ms | cold call ms | unstable A ms | B ms | mix ms | heapUsed MB | bytecode KB | hot iters |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| default | 24.9 | 11.3 | 1.45 | 1.33 | 0.41 | 8.6 | 893 | 153562500 |
| always-turbofan | 240.8 | 1622.6 | 3.46 | 2.60 | 2.85 | 14.5 | 894 | 11646000 |
| always-sparkplug | 36.3 | 3.8 | 1.41 | 1.29 | 0.40 | 9.8 | 893 | 156658000 |
| no-sparkplug | 24.5 | 4.9 | 1.60 | 1.57 | 0.69 | 6.3 | 893 | 151025500 |
| no-opt | 24.3 | 10.3 | 3.48 | 3.42 | 3.69 | 8.4 | 893 | 9079000 |
| jitless | 24.2 | 4.3 | 4.78 | 4.87 | 5.23 | 6.9 | 893 | 6044500 |
| lite-mode | 23.7 | 4.2 | 4.75 | 4.92 | 5.18 | 6.6 | 893 | 6153500 |
| eager | 24.6 | 11.0 | 1.35 | 1.57 | 0.40 | 8.0 | 893 | 152693500 |

### node22 (N_COLD=2000, HOT_MS=1500, UNSTABLE_N=20000; медианы 5 процессов)

| variant | cold ms | × | hot peak it/ms | × | 1st window it/ms | t90 ms | unstable ms | × | rss MB | code KB | compiles M/TF | deopts |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| default | 35.1 | ×1.00 | 97285 | ×1.00 | 69930 | 75 | 3.49 | ×1.00 | 60.2 | 3261 | 0/9 | 3 |
| always-turbofan | 28.3 | ×0.81 | 121656 | ×1.25 | 69008 | 175 | 3.46 | ×0.99 | 58.6 | 2040 | 0/8 | 1 |
| always-sparkplug | 40.8 | ×1.16 | 116683 | ×1.20 | 71499 | 128 | 3.14 | ×0.90 | 61.2 | 3729 | 0/9 | 3 |
| no-sparkplug | 28.2 | ×0.80 | 99615 | ×1.02 | 64989 | 75 | 3.84 | ×1.10 | 58.4 | 2026 | 0/9 | 3 |
| no-opt | 34.9 | ×0.99 | 8727 | ×0.09 | 6656 | 551 | 10.37 | ×2.97 | 53.0 | 3244 | 0/0 | 0 |
| maglev | 34.0 | ×0.97 | 100976 | ×1.04 | 71999 | 75 | 3.32 | ×0.95 | 60.2 | 3261 | 0/9 | 3 |
| jitless | 27.4 | ×0.78 | 4974 | ×0.05 | 3716 | 150 | 16.19 | ×4.64 | 51.2 | 2009 | 0/0 | 0 |
| lite-mode | 28.5 | ×0.81 | 4438 | ×0.05 | 3828 | 25 | 15.76 | ×4.52 | 49.2 | 2009 | 0/0 | 0 |
| eager | 37.3 | ×1.06 | 111184 | ×1.14 | 73216 | 325 | 3.14 | ×0.90 | 60.6 | 3268 | 0/15 | 3 |

детали cold (create / call) и unstable (A / B / mix), node22:

| variant | cold create ms | cold call ms | unstable A ms | B ms | mix ms | heapUsed MB | bytecode KB | hot iters |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| default | 24.1 | 10.7 | 1.58 | 1.33 | 0.49 | 9.5 | 1173 | 138126000 |
| always-turbofan | 24.9 | 3.4 | 1.71 | 1.38 | 0.37 | 7.0 | 1173 | 143256500 |
| always-sparkplug | 37.6 | 3.2 | 1.46 | 1.31 | 0.36 | 9.7 | 1173 | 143898500 |
| no-sparkplug | 23.8 | 4.4 | 1.73 | 1.50 | 0.60 | 7.8 | 1173 | 140046000 |
| no-opt | 24.0 | 10.6 | 3.27 | 3.63 | 3.51 | 9.2 | 1173 | 10653000 |
| maglev | 23.4 | 10.6 | 1.60 | 1.35 | 0.38 | 9.0 | 1173 | 139223000 |
| jitless | 23.2 | 4.0 | 5.06 | 5.38 | 5.63 | 7.8 | 1173 | 5896000 |
| lite-mode | 24.1 | 4.1 | 4.96 | 5.40 | 5.41 | 7.2 | 1173 | 5911500 |
| eager | 25.4 | 10.9 | 1.38 | 1.17 | 0.38 | 9.7 | 1173 | 140477000 |

### node24 (N_COLD=2000, HOT_MS=1500, UNSTABLE_N=20000; медианы 5 процессов)

| variant | cold ms | × | hot peak it/ms | × | 1st window it/ms | t90 ms | unstable ms | × | rss MB | code KB | compiles M/TF | deopts |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| default | 30.4 | ×1.00 | 140112 | ×1.00 | 78878 | 175 | 2.95 | ×1.00 | 64.5 | 3470 | 14/9 | 7 |
| always-turbofan | 29.2 | ×0.96 | 114315 | ×0.82 | 102675 | 50 | 2.59 | ×0.88 | 64.4 | 3456 | 14/6 | 4 |
| always-sparkplug | 40.2 | ×1.32 | 138627 | ×0.99 | 94287 | 75 | 2.55 | ×0.86 | 64.7 | 3936 | 14/9 | 7 |
| no-sparkplug | 29.0 | ×0.95 | 115015 | ×0.82 | 98952 | 50 | 2.97 | ×1.01 | 62.0 | 2226 | 14/9 | 7 |
| no-opt | 28.0 | ×0.92 | 7434 | ×0.05 | 6532 | 50 | 9.71 | ×3.29 | 54.7 | 3409 | 0/0 | 0 |
| no-maglev | 29.5 | ×0.97 | 114689 | ×0.82 | 84351 | 150 | 3.82 | ×1.29 | 62.4 | 3428 | 0/8 | 3 |
| jitless | 27.2 | ×0.90 | 4523 | ×0.03 | 4108 | 25 | 14.57 | ×4.94 | 51.6 | 2169 | 0/0 | 0 |
| lite-mode | 27.9 | ×0.92 | 5331 | ×0.04 | 4139 | 75 | 14.76 | ×5.00 | 49.5 | 2169 | 0/0 | 0 |
| eager | 37.5 | ×1.23 | 117071 | ×0.84 | 90988 | 75 | 2.54 | ×0.86 | 64.6 | 3466 | 21/15 | 9 |
| turbolev | 31.2 | ×1.03 | 462390 | ×3.30 | 300646 | 100 | 2.61 | ×0.88 | 63.1 | 3484 | 15/10 | 8 |

детали cold (create / call) и unstable (A / B / mix), node24:

| variant | cold create ms | cold call ms | unstable A ms | B ms | mix ms | heapUsed MB | bytecode KB | hot iters |
|---|--:|--:|--:|--:|--:|--:|--:|--:|
| default | 25.3 | 5.1 | 0.94 | 1.58 | 0.76 | 9.8 | 1248 | 163725500 |
| always-turbofan | 25.2 | 4.1 | 1.04 | 0.70 | 0.82 | 9.4 | 1248 | 163585000 |
| always-sparkplug | 36.9 | 3.3 | 1.01 | 0.72 | 0.76 | 10.2 | 1248 | 163757500 |
| no-sparkplug | 24.7 | 4.2 | 1.24 | 0.88 | 0.90 | 8.2 | 1248 | 163445500 |
| no-opt | 23.2 | 5.0 | 3.25 | 3.10 | 3.37 | 9.7 | 1248 | 10607500 |
| no-maglev | 24.3 | 6.8 | 1.98 | 1.37 | 0.42 | 9.1 | 1248 | 162211500 |
| jitless | 23.2 | 4.0 | 4.71 | 4.74 | 5.16 | 8.2 | 1248 | 6386500 |
| lite-mode | 23.8 | 4.0 | 4.74 | 4.92 | 5.05 | 7.2 | 1248 | 6252000 |
| eager | 30.6 | 5.3 | 0.91 | 0.69 | 0.53 | 10.4 | 1248 | 165746000 |
| turbolev | 25.1 | 5.5 | 1.10 | 0.93 | 0.47 | 10.2 | 1248 | 542448500 |

### СВОДНАЯ: ratio к default (cold ms / hot peak / unstable ms)

| variant | node20 cold | node20 hot | node20 unst | node22 cold | node22 hot | node22 unst | node24 cold | node24 hot | node24 unst |
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| always-turbofan | ×50.49 | ×0.09 | ×2.76 | ×0.81 | ×1.25 | ×0.99 | ×0.96 | ×0.82 | ×0.88 |
| always-sparkplug | ×1.10 | ×1.24 | ×1.00 | ×1.16 | ×1.20 | ×0.90 | ×1.32 | ×0.99 | ×0.86 |
| no-sparkplug | ×0.80 | ×1.01 | ×1.20 | ×0.80 | ×1.02 | ×1.10 | ×0.95 | ×0.82 | ×1.01 |
| no-opt | ×0.96 | ×0.06 | ×3.30 | ×0.99 | ×0.09 | ×2.97 | ×0.92 | ×0.05 | ×3.29 |
| jitless | ×0.79 | ×0.04 | ×4.64 | ×0.78 | ×0.05 | ×4.64 | ×0.90 | ×0.03 | ×4.94 |
| lite-mode | ×0.77 | ×0.04 | ×4.61 | ×0.81 | ×0.05 | ×4.52 | ×0.92 | ×0.04 | ×5.00 |
| eager | ×0.98 | ×1.01 | ×1.04 | ×1.06 | ×1.14 | ×0.90 | ×1.23 | ×0.84 | ×0.86 |
| maglev | n/a | n/a | n/a | ×0.97 | ×1.04 | ×0.95 | n/a | n/a | n/a |
| no-maglev | n/a | n/a | n/a | n/a | n/a | n/a | ×0.97 | ×0.82 | ×1.29 |
| turbolev | n/a | n/a | n/a | n/a | n/a | n/a | ×1.03 | ×3.30 | ×0.88 |

### разброс повторов — контроль шума

ячеек с разбросом >20% медианы (cold или hot peak): 22 из 27
  node20/default: cold 36.43±12.3, hotPeak 107959.6±30479
  node20/always-sparkplug: cold 40.17±11.1, hotPeak 134135.4±29405
  node20/no-sparkplug: cold 29.32±3.9, hotPeak 108766.5±29959
  node20/no-opt: cold 34.87±16, hotPeak 6446.4±1926
  node20/lite-mode: cold 27.96±7.1, hotPeak 4386.8±1192
  node20/eager: cold 35.64±13.2, hotPeak 108829.3±4430
  node22/always-turbofan: cold 28.31±1.1, hotPeak 121656.3±25118
  node22/always-sparkplug: cold 40.75±4.2, hotPeak 116682.9±23499
  node22/no-sparkplug: cold 28.19±15.3, hotPeak 99614.5±24631
  node22/no-opt: cold 34.9±2.4, hotPeak 8727.2±1913
  node22/maglev: cold 34.02±3.2, hotPeak 100976.4±23602
  node22/jitless: cold 27.37±6.3, hotPeak 4973.9±1070
  node22/lite-mode: cold 28.5±2.3, hotPeak 4438.1±1144
  node22/eager: cold 37.32±7.4, hotPeak 111183.5±25138
  node24/default: cold 30.37±13.2, hotPeak 140111.5±29425
  node24/always-sparkplug: cold 40.21±8.8, hotPeak 138627.2±27571
  node24/no-sparkplug: cold 28.98±3.3, hotPeak 115014.6±31078
  node24/no-maglev: cold 29.46±14.9, hotPeak 114688.7±30016
  node24/jitless: cold 27.2±30.9, hotPeak 4523.2±770
  node24/lite-mode: cold 27.87±1, hotPeak 5330.5±1196
  node24/eager: cold 37.46±11.9, hotPeak 117070.5±26073
  node24/turbolev: cold 31.22±9.7, hotPeak 462390.3±100008

### Как читать таблицы

`cold ms` = создание 2000 функций + 3 вызова каждой; `hot peak` = итераций тройки функций на мс (медиана 5 лучших окон по 25 мс); `1st window` = пропускная способность первого окна 25 мс; `t90` = конец первого окна с ≥90% пика (квантовано по 25 мс, шумно); `unstable ms` = 60 000 вызовов с двумя формами; `compiles M/TF` = число строк `completed compiling … (target MAGLEV)` / `(target TURBOFAN*)` в trace-прогоне; `deopts` = число строк `bailout (kind` во всём процессе (включая функции-циклы харнесса: в `default` это 2 деопта `hotPhase` «Insufficient type feedback for generic named access», 1 деопт `unstablePhase` «Insufficient type feedback for call» и 1–2 деопта `unstable` «wrong map» — см. `artifacts/trace-counts/*.txt`).

### Что показывает матрица

1. **`--always-turbofan` на node20 (V8 11.3) — это и есть «потратить мс на старте»: cold ×50 (36 → 1839 мс), 4309 синхронных TurboFan-компиляций (`ConcurrencyMode::kSynchronous`, `because --always-turbofan`), код 7.5 MB против 2.9 MB.** Обещанного «буста потом» нет: hot-пик ×0.09 (108k → 9.9k it/ms), первое окно 7.1k против 82k, unstable ×2.76, при **нуле** деоптов в trace-прогоне. То есть код, скомпилированный TurboFan'ом без feedback, не деоптимизируется — он просто медленный на порядок и остаётся таким на всю hot-фазу (пере-оптимизации «hot and stable» в логе нет).
2. **На node22/node24 флаг `--always-turbofan` ведёт себя иначе:** в логе 4330/4346 строк `[optimizing … because --always-turbofan]`, но `completed compiling … TURBOFAN` всего 8/6 (default: 9/9), а cold-фаза даже быстрее default (28.3 vs 35.1 мс; 29.2 vs 30.4) — при этом время cold-вызовов 3.4 мс против 10.7 мс совпадает с вариантами `--no-sparkplug` (4.4) и `--always-sparkplug` (3.2), т.е. в этих трёх вариантах во время cold-фазы нет фоновой Sparkplug-batch-компиляции 2000 функций, которая есть в default (утверждение только по цифрам, механизм здесь не исследовался). Hot-пик: node22 ×1.25, node24 ×0.82 — обе цифры внутри разброса повторов (±25k it/ms при пике 97–140k), т.е. **не отличимы от default**.
3. **Отключение оптимизирующих тиров стоит ×11–33 в горячем коде:** `no-opt` (Ignition+Sparkplug) hot ×0.05–0.09, `--jitless` и `--lite-mode` ×0.03–0.05; unstable ×3–5. Cold при этом *не* становится медленнее (×0.77–0.99): для кода, который выполняется 3 раза, оптимизирующие компиляторы ничего не дают и ничего не стоят — они и не запускаются (0 компиляций).
4. **`--always-sparkplug` — единственный вариант, где cold стабильно дороже default на всех трёх рантаймах: ×1.10 / ×1.16 / ×1.32** (создание 2000 функций 36–38 мс против 24–25, код +0.45–0.65 MB); hot внутри шума (×1.24 / ×1.20 / ×0.99 при разбросе ±25–30%).
5. **`eager` (порог TurboFan 100 вызовов, Maglev 20 / бюджет прерываний 1000):** компиляций больше (node24: 21/15 против 14/9; node20: 20 против 11), но hot-пик внутри шума (×1.01 / ×1.14 / ×0.84), cold ×0.98–1.23. Более ранняя оптимизация не дала измеримого выигрыша ни в одной фазе.
6. **node24 `--no-maglev`:** hot ×0.82 (внутри шума), unstable ×1.29, TurboFan-компиляций 8 против 9+14 Maglev. **node22 `--maglev`:** Maglev-компиляций 0 — на этой сборке флаг не приводит к Maglev-коду (совпадает с tier-status: Maglev-бита не появилось).
7. **`--turbolev` на node24 не упал** и дал hot-пик ×3.30 (462k против 140k it/ms, первое окно 300k против 79k), cold и unstable как default, 15/10 компиляций. Столь большой разрыв на трёх крошечных функциях скорее говорит о том, что новый бэкенд иначе скомпилировал сам цикл `hotPhase` (например, что-то вынес/удалил), чем о ×3.3 на реальном коде — это аномалия для отдельной проверки, а не результат.
8. Память: `--jitless`/`--lite-mode` экономят 7–15 MB RSS (45–52 против 55–65) и ~1.2 MB кода; `--always-turbofan` на node20 +5 MB RSS и +4.6 MB кода; остальные варианты — в пределах 2–3 MB.

## Механизм: `feedback-matters.js` (почему код без feedback не «бустится»)

node24 (`artifacts/feedback-matters-node24.txt`), TurboFan:

| вариант | статус после 1-го вызова (синхронная компиляция) | `--trace-deopt` по `target` | первые 2000 вызовов | статус после 1e6 | 1e6 вызовов |
|---|---|---|---|---|---|
| empty (0 прогревочных) | **`Interpreted`** — TurboFan-код деоптимизировался на первом же вызове (компиляция 0.984 мс) | 1 строка: `reason: Insufficient type feedback for generic named access … <Code TURBOFAN_JS>` | 0.222 мс, после них `Interpreted\|OptimizingConcurrently` (компилируется заново, уже с feedback) | `TurboFanned`, MaybeDeopted=false | 3.27 мс (306k calls/ms) |
| warm (200 прогревочных) | `Optimized\|TurboFanned` (компиляция 0.776 мс) | 0 строк | 0.17 мс, всё ещё `TurboFanned` | `TurboFanned` | 3.30 мс (303k calls/ms) |

Maglev на node24: то же самое — `empty`: после 1-го вызова `Interpreted`, `reason: Insufficient type feedback for generic named access … <Code MAGLEV>` (компиляция 0.191 мс); `warm`: `Optimized|MaglevOptimized` без деоптов; через 1e6 вызовов оба — `TurboFanned` (естественный tier-up), 3.34 vs 3.19 мс.

node22 (`artifacts/feedback-matters-node22.txt`), TurboFan: `empty` → после 1-го вызова `Interpreted`, 1 деопт `Insufficient type feedback for generic named access … <Code TURBOFAN>`, первые 2000 вызовов 0.289 мс в интерпретаторе; `warm` → сразу `TurboFanned`, 0 деоптов, первые 2000 вызовов 0.152 мс. Через 1e6 вызовов оба `TurboFanned`: 7.28 vs 5.71 мс.

Итог механизма: оптимизирующий компилятор, запущенный без feedback, тратит ~1 мс (TurboFan) / ~0.2 мс (Maglev) на код, который выбрасывается на первом же вызове с причиной «Insufficient type feedback», после чего функция снова в интерпретаторе и ждёт обычного tier-up. С прогревом тот же компилятор за то же время выдаёт код, который живёт без деоптов. Бит `MaybeDeopted` к концу 1e6 вызовов не установлен в обоих вариантах: функция была пере-оптимизирована, по конечному статусу деопт уже не виден — его видно только по `--trace-deopt` или по статусу сразу после первого вызова.

## Аномалии — явно

1. **`--always-turbofan` на node22/24 не компилирует cold-функции TurboFan'ом** (тысячи строк `optimizing … because --always-turbofan`, но `completed compiling` — единицы, и cold-вызовы быстрее default). Семантика флага на V8 12.4/13.6 явно другая, чем на 11.3; здесь только зафиксировано.
2. **node20 `--always-turbofan`: hot ×0.09 при 0 деоптов** — медленный TurboFan-код без feedback не переоптимизируется (нет строк `marking … hot and stable` для `hotA/B/C`).
3. **`--turbolev` hot ×3.30** — см. п. 7 выше; на первом (забракованном) прогоне матрицы было ×2.93, т.е. эффект воспроизводится, но природа не установлена.
4. **node22 `--maglev`: 0 Maglev-компиляций** и в матрице, и в tier-status.
5. **Шум hot-фазы велик:** разброс пика по 5 повторам ±20–30% медианы у 22 из 27 ячеек (окна 25 мс, 4 vCPU с соседними процессами, фоновые компиляции внутри окна). Отличия hot-пика < ×1.3 между JIT-вариантами **не интерпретируются**. Надёжно отличимы только: no-opt/jitless/lite-mode (×0.03–0.09), node20 always-turbofan (×0.09), turbolev (×3.3).
6. `t90` (время до 90% пика) квантован окнами 25 мс и по медианам скачет (node22 `no-opt` 551 мс, `eager` 325 мс при default 75) — использовать только как «в первом окне / не в первом».
7. Cold-фаза node24 `--jitless`: разброс 30.9 мс при медиане 27.2 (один выброс); медиана держится.
8. В tier-status на node24 после выхода из OSR-цикла статус функции = `1` (только `IsFunction`, ни `Interpreted`, ни `Baseline`); на node22 — `Baseline|MarkedForConcurrentOptimization`. Не интерпретируется здесь.
9. В первом прогоне матрицы цикл hot-фазы сам деоптимизировался (`overflow` аккумулятора Smi→double, `wrong map` при первом `push` окна) — по 11 деоптов на процесс на node24. После правки харнесса осталось 2 деопта `hotPhase` («Insufficient type feedback for generic named access» — ветка записи окна не имела feedback к моменту OSR-компиляции). Это цена харнесса, одинаковая для всех вариантов.

## Что цифры показывают и чего не показывают

Показывают:
- Тир функции можно проверить точно (natives, бит-маска), по событиям (`--trace-opt/--trace-deopt`, `--log-function-events`) и по профилю (`--prof`: `~ ^ + *`); `--cpu-prof`/trace-events тир не содержат.
- Порог tier-up — не фиксированное число вызовов: Sparkplug на node20 в двух прогонах пришёл на 100 и на 399 вызове, Maglev на node24 начал компилироваться на ~600, TurboFan установился только после паузы.
- «Всегда TurboFan» в буквальном смысле (node20, где флаг действительно компилирует всё синхронно): старт ×50 дороже, горячий код ×11 медленнее, код ×2.6 больше, буста нет.
- Оптимизирующий компилятор без feedback производит код, который выбрасывается на первом вызове (`Insufficient type feedback`), — это и есть причина, почему нужен прогрев в Ignition/Sparkplug до Maglev/TurboFan.
- Cold-код (3 вызова × 2000 функций) одинаково быстр с JIT и без него (×0.77–1.0): оптимизирующие тиры для него не запускаются.
- Более ранняя оптимизация (`eager`) не даёт измеримого выигрыша на этом workload.

Не показывают:
- Какой выигрыш даёт TurboFan vs Maglev vs Sparkplug **по отдельности** на реальном коде — hot-фаза слишком шумна и слишком мала (3 функции по 5 полей), а различия JIT-вариантов внутри ±30%.
- Почему `--always-turbofan` на V8 12.4/13.6 не компилирует cold-функции и почему `--turbolev` даёт ×3.3 — нужны исходники/дополнительные эксперименты.
- Стоимость деоптов в unstable-фазе в абсолюте: 1–5 мс на 60 000 вызовов — на уровне разрешения; видно только грубое ×3–5 у вариантов без оптимизации и ×2.8 у node20 always-turbofan.
- Поведение в браузере/DevTools — не проверялось.

## Артефакты

- `tier-status.js` (библиотека + CLI), `run-tier-status.sh` → `artifacts/tier-status-{node20,node21,node22,node22-maglev,node24,node24-no-maglev,node24-always-sparkplug}.txt`, `artifacts/natives-runtime-method.txt`.
- `trace-demo.js` → `artifacts/trace-opt-node22.txt`, `artifacts/trace-opt-node24.txt`.
- `detect-workload.js`, `run-detect-methods.sh` → `artifacts/detect-prof.txt`, `detect-prof-full.txt`, `detect-log-function-events.txt`, `detect-log-code.txt`, `detect-trace-events.txt`, `detect-cpu-prof.txt`, `detect-trace-opt-node2{2,4}.txt`.
- `always-turbofan-bench.js`, `run-matrix.sh`, `collect.js`, `report-tiers.js` → `raw-runs.jsonl` (135 прогонов), `traces.jsonl` (27 trace-прогонов), `results.jsonl` (27 ячеек), `matrix.log`, `artifacts/report-tiers.md`, `artifacts/trace-counts/<runtime>-<variant>.txt`.
- `feedback-matters.js` → `artifacts/feedback-matters-node22.txt`, `artifacts/feedback-matters-node24.txt`.
- `artifacts/versions.txt`, `artifacts/flag-support.txt`.

## Источники

заполняется на этапе синтеза
