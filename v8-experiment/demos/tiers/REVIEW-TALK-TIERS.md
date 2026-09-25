# Сверка доклада по ярусам: «какой компилятор вызван» и «почему не сразу TurboFan»

**Дата:** 2026-09-25. **Что сверял:** ветка `v8-talk-verify` — `talk/annotations.md`, `talk/06-talk-final.md`, `talk/10-slides.pptx` (слайды 4.2, 4.3, 4.4, 5.1, 5.2, 10.1, 10.2, 11.3, Q&A), `v8-experiment/PITFALLS.md`, `v8-experiment/docker/{tier-bench,tier-when,tier-threshold,shape-analyzer-status}.js`, `why-not-turbofan.sh`, `docker/results/NUMBERS-*.md`, x64-прогоны из ветки `v8-talk-results`.
**Чем сверял:** исходники V8 по тегам 11.3.244.8 / 12.4.254.21 / 13.6.233.17 и `main` (15.6.0-dev на 2026-09-25); посты блога V8 через исходники сайта (`github.com/v8/v8.dev`, сам v8.dev из контейнера закрыт); прогоны в этой папке на Node 20.20.2 / 22.22.2 / 24.21.0, linux/x64 (`RESULTS-TIERS.md`).

## Коротко

Оба вопроса в докладе закрыты, и всё, что проверял, сходится с исходниками и воспроизводится на x64:

- «Почему не сразу TurboFan» — слайд 4.3 и первые два ответа Q&A: цена компиляции + «на первом вызове ставить не на что». Обе причины подтверждаются исходниками и замерами здесь.
- «Как убедиться, какой компилятор» — в докладе это `%GetOptimizationStatus` (5.2, PITFALLS) и `--trace-opt`/`--trace-deopt` (5.1). Работает, но это не всё: есть способы без natives (ниже), их стоит добавить в Q&A, потому что слайд 11.3 «как проверить у себя» ярус не упоминает вовсе.

Нашёл одну ошибку в скрипте, три формулировки, которые стоит уточнить, и одно дополнение к Q&A.

## Что подтверждено

| утверждение доклада | где | чем подтверждено |
|---|---|---|
| Ярусы Ignition → Sparkplug → Maglev → TurboFan; «примерно с восьмого вызова заводятся записи»; «≈ — бюджет по длине байткода» | 4.2 | `flag-definitions.h`: `invocation_count_for_feedback_allocation=8`, `invocation_count_for_maglev=400`, `invocation_count_for_turbofan=3000`; `tiering-manager.cc`: бюджет прерываний = длина байткода × эти числа, т.е. считаются не вызовы, а исполненный байткод |
| Ignition и Sparkplug не спекулируют, Maglev и TurboFan вшивают ставку | 4.4, Q&A | пост Sparkplug: компилирует байткод в машинный код за один линейный проход, без IR, вызывает те же builtins, что интерпретатор; пост Maglev: «often speculative machine code» |
| Лестница `--max-opt=0/1/2/3`, ×13 | 4.3 | флаг есть на Node 20/22/24 с тем же описанием; здесь `no-opt` (Ignition+Sparkplug) против default даёт hot-пик ×0.05–0.09 на всех трёх Node |
| «npm --version: из 662 функций до TurboFan дошла одна» | 4.3 | здесь Node 24 x64: 707 функций с байткодом, до Maglev 13, до TurboFan 1 (`normalizeString`) |
| `--always-turbofan`: старт вдвое дольше (34 → 77 мс) | 4.3 | здесь Node 24 x64, 5 прогонов: default 89–94 мс, `--always-sparkplug` 109–185, `--always-turbofan` 171–211 |
| «На первом вызове ставить не на что» | 4.3, Q&A | исходники: без флага TurboFan на неинициализированном feedback ставит безусловный деопт `Insufficient type feedback for …` (`JSTypeHintLowering::BuildDeoptIfFeedbackIsInsufficient`, `JSCallReducer::ReduceForInsufficientFeedback`); `feedback-matters.js`: оптимизация с пустым feedback → деопт на первом же вызове на Node 22 и 24, с 200 прогревочными вызовами → 0 деоптов |
| Между запусками сохраняется только байткод | Q&A | пост «Code caching for JavaScript developers»: «Code caching (also known as bytecode caching)… the compiled bytecode is stored in a hashtable» |
| Turbolev: флаг есть в 13.6, выключен по умолчанию и в main, «4th tier compiler instead of Turbofan» | 10.1 | V8 `main` на 2026-09-25 (15.6.0): `DEFINE_BOOL(turbolev, false, "use Turbolev (≈ Maglev + Turboshaft combined) as the 4th tier compiler instead of Turbofan")` — без изменений; `--maglev-as-top-tier` его выключает |
| Turboshaft-бэкенд компилирует примерно вдвое быстрее, Chrome 120 | 10.2 | пост «V8 is Faster and Safer than Ever!» (14.12.2023), дословно: «Since Chrome 120, the CPU-agnostic backend phases all use Turboshaft rather than Turbofan, and compile about twice as fast as before» |
| Компиляция: Maglev дешевле TurboFan (0.6 против 2.5 мс) | 4.3 | пост Maglev: «roughly 10x slower than Sparkplug, and 10x faster than TurboFan»; тот же пост про Sparkplug: «almost instantaneously». Ваши ×4 — частный случай маленькой функции, направление то же. В `--trace-opt` «took a, b, c ms» — три фазы (Maglev: prepare/execute/finalize; TurboFan: create-graph/optimize/codegen), брать сумму |
| `%GetOptimizationStatus(score) = 81` → function, optimized, turbofan | 5.2, CHECKS | биты 0, 4, 6; enum `OptimizationStatus` побайтно одинаков в 11.3 и 12.4, в 13.6 добавлены только биты 21–23 |
| Sparkplug на arm64 медленнее Ignition, на x64 быстрее | 4.3 | x64 CI из `v8-talk-results`: Ignition 1101 → Sparkplug 824 (Node 24), 1136 → 787 (Node 22); пост Maglev даёт +45% Sparkplug к Ignition на JetStream — то есть arm64-число действительно аномалия |

## Что поправить

1. **`docker/shape-analyzer-status.js` — таблица битов неверна.** В скрипте `osr: 1024`, `baseline: 1<<14`, `topmostTurbo: 1<<15`. По `src/runtime/runtime.h` (все три версии): `1<<10` = OptimizingConcurrently, `1<<14` = MarkedForDeoptimization, `1<<15` = **Baseline** (Sparkplug), `1<<12` = TopmostFrameIsTurboFanned, `1<<16` = TopmostFrameIsInterpreted, `1<<17` = TopmostFrameIsBaseline, `1<<19` = TopmostFrameIsMaglev. Для статуса 81 это не играет, но функция на Sparkplug напечатается как «topmostTurbo». В `tier-when.js` и `tier-threshold.js` биты правильные (`1<<15` = Sparkplug). Готовый декодер всех 24 битов — `tier-status.js` в этой папке.

2. **«Заставил движок компилировать TurboFan всё подряд» (речь 4.3) — на Node 24 флаг этого не делает.** `npm --version` под `--always-turbofan` на Node 24: 841 строка `[optimizing … because --always-turbofan]`, но только 55 компиляций и 14 функций (из ~700) получили TurboFan-код; старт при этом всё равно вдвое дольше. Механизм в исходниках: `GetOrCompileOptimized` сбрасывает запрос и отказывает, пока `invocation_count < --minimum-invocations-before-optimization` (по умолчанию 2). На Node 20 (V8 11.3) флаг действительно компилирует всё: 4309 синхронных компиляций, cold-фаза ×50 (36 → 1839 мс) — и горячий код после этого **в 11 раз медленнее** обычного при нуле деоптов и без переоптимизации: под этим флагом TurboFan не ставит деопт на пустой feedback (`set_bailout_on_uninitialized` только когда флаг выключен), а генерирует generic-код. Это самый наглядный ответ на «потратить мс на старте и получить буст» — буста нет. Формулировка для слайда: «`--always-turbofan` — «оптимизируй при первой возможности»: старт вдвое дольше, а там, где движок и правда компилирует всё сразу (Node 20), горячий код выходит в 11 раз медленнее обычного — вшивать нечего».

3. **PITFALLS: «для сравнения ярусов нужен Node 24 или явный `--maglev`».** На Node 22.22.2 флаг принимается, но Maglev нет в сборке: `process.config.variables.v8_enable_maglev = 0` (на Node 20 тоже 0, на Node 24 — 1). Под `--maglev` на Node 22: 0 строк `MAGLEV` в `--trace-opt`, бит Maglev не появляется, лестница та же (`{"baseline":2649,"turbofan":8343}`). Правильно: только Node 24.

   Ещё одно к этому же слайду: **флага `--always-turbofan` в V8 больше нет** — он есть в тегах 13.6–13.9 (Node 24 = 13.6), но отсутствует в `flag-definitions.h` уже с 14.0.365.1 (проверены также 14.5.100, 15.0.100 и `main`). На следующих Node `why-not-turbofan.sh` упадёт с «bad option»; на слайде стоит подписать «V8 13.6 / Node 24».

4. **NUMBERS/PITFALLS: «Sparkplug ~700 (665–1011), на Node 22 — 2649» — артефакт batch-компиляции, не порог.** Sparkplug компилируется пачками (`--baseline-batch-compilation`, порог 4096 байт оценочного размера); одна крошечная функция в микробенче батч не набирает. С `--no-baseline-batch-compilation` Sparkplug приходит на **9-м** вызове и на Node 22, и на Node 24 (проверено: `{"baseline":9,…}`). В приложении с тысячами функций батч заполняется чужими функциями, так что «десятки» на слайде 4.2 честнее, чем «~700» из бенча. Стоит сноска в PITFALLS. Для TurboFan цифры сходятся с вашими: Node 24 — 14 023 с фоновой компиляцией и 10 668 без (`--no-concurrent-recompilation`), Node 22 — 5541 / 3011.

## Что добавить в Q&A: «как убедиться, какой компилятор»

Проверено здесь на Node 24 (`artifacts/detect-*.txt`), без `--allow-natives-syntax`:

- **`--log-function-events --logfile=fe.log --no-logfile-per-isolate`** — самый удобный способ: строки `function,interpreter|baseline|maglev|turbofan,…,<имя>` и `function,first-execution-BASELINE|MAGLEV|TURBOFAN_JS,…` дают историю ярусов каждой функции по имени. Имена событий берутся из `CodeKind` в `Compiler::LogFunctionCompilation`.
- **`--prof` + `--prof-process`** — префикс перед именем функции: `~` Ignition, `^` Sparkplug, `+` Maglev, `*` TurboFan (`tools/profile.mjs`, `CodeKindToMarker`); одна функция даёт по строке на каждый ярус, где её застали тики.
- **`--trace-opt`** — `for optimization to MAGLEV|TURBOFAN_JS`, `completed compiling … (target …)`: только события компиляции, не «текущее состояние». **`--trace-deopt`** — `<Code MAGLEV|TURBOFAN_JS>` в строке `bailout`: ярус кода в момент отката.
- **`%GetOptimizationStatus` можно включить в рантайме:** `require('v8').setFlagsFromString('--allow-natives-syntax')`, затем `new Function('f', 'return %GetOptimizationStatus(f)')` — работает на Node 20/21/22/24; действует только на код, распарсенный после установки флага. Есть и булевы `%ActiveTierIsIgnition/Sparkplug/Maglev/Turbofan(f)` (12.4 и 13.6).
- **Не показывают ярус:** `--cpu-prof` / DevTools JavaScript Profiler (в `.cpuprofile` нет ни одного упоминания ярусов) и DevTools Performance («Optimize code» без имени компилятора). `--trace-event-categories disabled-by-default-v8.compile` даёт `V8.MaglevTask`/`V8.OptimizeCode` с длительностями, но без имён функций.

## Дополнение к «почему V8 не греет на старте» (Q&A)

- Пороги можно опустить флагами (`--invocation-count-for-turbofan=100 --invocation-count-for-maglev=20`, вариант `eager` в матрице): компиляций больше (Node 24: 21/15 против 14/9), а hot-пик не выше (×0.84–1.14, внутри шума), время до 90% пика на Node 22 хуже (325 против 75 мс). Раньше не значит быстрее — компилятор получает менее зрелый feedback.
- `--jitless` и `--lite-mode` (V8 без оптимизирующих ярусов) экономят 7–15 MB RSS на этих нагрузках ценой ×20–30 в горячем коде — это цена, которую платит «всегда оптимизировать»: оптимизированный код и feedback-вектора занимают память (пост «A lighter V8»: lite mode даёт −22% кучи именно за счёт отключения оптимизации).

## Как воспроизвести

```
# ярус по вызовам, с батчем Sparkplug и без
node --allow-natives-syntax                                  tier-status.js
node --allow-natives-syntax --no-baseline-batch-compilation  tier-status.js
# npm --version: сколько функций доходит до ярусов и что делает --always-turbofan
node --trace-opt                  $(npm root -g)/npm/bin/npm-cli.js --version 2>&1 | grep -c 'completed optimizing.*TURBOFAN'
node --trace-opt --always-turbofan $(npm root -g)/npm/bin/npm-cli.js --version 2>&1 | grep -c 'because --always-turbofan'
# Maglev в сборке?
node -p process.config.variables.v8_enable_maglev
# матрица и детекция без natives
./run-matrix.sh && node report-tiers.js; ./run-detect-methods.sh
```
