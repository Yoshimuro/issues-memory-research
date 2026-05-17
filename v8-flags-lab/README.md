# V8 Flags Lab

Лаборатория для изучения того, как V8/Node flags влияют на память: `RSS`, `heapUsed`, `heapTotal`, `external`, `arrayBuffers` и GC. CPU и latency здесь вторичны.

## Структура

```text
v8-flags-lab/
├── lib/metrics.js          # memoryUsage + heap spaces + perf_hooks GC + latency
├── lib/evidence-model.js   # strong matrix, пороги, decision labels
├── lib/run-metrics.js      # выборка метрик из JSON + bootstrap
├── sync-data-bench.js      # controlled memory workload
├── async-http-server.js    # долгоживущий HTTP процесс
├── load-client.js          # простой генератор HTTP-нагрузки без npm deps
├── run-experiment.js       # повторы, manifest, local/docker режимы
├── run-strong-matrix.js    # полная strong-матрица + matrix-manifest.json
├── analyze-runs.js         # bootstrap CI и decision по результатам
├── compare-runs.js         # агрегация memory-метрик
├── Dockerfile
├── docker-compose.yml
└── results/
```

## Главный принцип

Для малоизвестных V8-флагов используем `single-factor`: меняется только один флаг или одно значение флага.

Для heap limits допустим отдельный тип `preset`: например `--max-old-space-size=384 --max-semi-space-size=64` против default. Это корректно, если вывод звучит как “эта heap policy ведет себя так”, а не “эффект вызвал конкретно old-space или semi-space”.

Типы экспериментов:

- `single-factor`: один измененный параметр.
- `preset`: согласованная heap policy против default.
- `diagnostic`: trace/stress flags, которые помогают объяснить механизм, но не являются чистым benchmark.

## Быстрый запуск локально

```bash
cd v8-flags-lab

REPEATS=5 node run-experiment.js heap-preset
node compare-runs.js results/<run-id>/heap-preset
```

По умолчанию runner запускает `sync-data-bench.js` с warm-up, controlled retention и idle-фазой, чтобы были видны не только пики, но и то, возвращает ли V8 память после нагрузки.

## Профили давления (`PRESSURE_PROFILE`)

Один и тот же флаг может быть не виден на слабом workload. `sync-data-bench.js` задаёт пресеты через `PRESSURE_PROFILE` (любая переменная из пресета можно переопределить env-ом).

| Профиль | Зачем |
|---------|--------|
| `mixed` | Базовый smoke: как раньше по умолчанию. |
| `new-space-pressure` | Короткоживущие объекты, JSON churn, почти без retention — полезно для semi-space / scavenger / growth / lazy new-space. |
| `old-space-pressure` | Агрессивный retain объектов — давление на old space и major GC. |
| `external-pressure` | Buffer churn и retained buffers — рост `external` / `arrayBuffers` и RSS вне JS heap. |
| `idle-recovery` | Спайк перед измерением (`SPIKE_ITERATIONS`), затем нагрузка и длинный `IDLE_S` — footprint после простоя и memory reducer. |

Примеры:

```bash
PRESSURE_PROFILE=new-space-pressure REPEATS=5 node run-experiment.js max-semi-space-size
PRESSURE_PROFILE=old-space-pressure REPEATS=5 node run-experiment.js max-old-space-size
PRESSURE_PROFILE=idle-recovery REPEATS=5 node run-experiment.js memory-reducer
MODE=docker MEMORY_LIMIT=512m PRESSURE_PROFILE=external-pressure node run-experiment.js heap-preset
```

## Долгоживущие фазовые прогоны

Короткий процесс часто не успевает показать memory behavior, который важен для production: прогрев, пиковая нагрузка, steady state и возврат памяти после idle. Поэтому `sync-data-bench.js` пишет `phaseSummaries` по фазам:

- `warmup`: измеряемый прогрев перед основной нагрузкой.
- `spike`: агрессивный retention перед steady-фазой.
- `steady`: основная измеряемая фаза, latency samples пишутся здесь.
- `idle`: ожидание после нагрузки, чтобы увидеть recovery.

Полезные параметры:

- `WARMUP_ITERATIONS=5000`
- `SPIKE_ITERATIONS=10000`
- `STEADY_ITERATIONS=50000`
- `IDLE_S=60`
- `REPEATS=7`

Пример длинного New Space эксперимента:

```bash
PRESSURE_PROFILE=new-space-pressure \
STEADY_ITERATIONS=50000 \
WARMUP_ITERATIONS=5000 \
SPIKE_ITERATIONS=10000 \
IDLE_S=60 \
REPEATS=7 \
node run-experiment.js semi-space-growth-factor

node compare-runs.js results/<run-id>/semi-space-growth-factor
```

В отчёте смотри не только верхнюю таблицу, но и блок `Phase summaries`: там видно, что было в `steady`, что осталось в `idle`, и помог ли флаг именно в нужной фазе.

## Практический маршрут по симптомам

Используй как чеклист: симптом → область памяти → что мерить → какой профиль → какие флаги пробовать.

**RSS уперся в container limit, а `heapUsed` кажется нормальным**

- Область: RSS = JS heap + external/arrayBuffers + native/code/stack/overhead.
- Метрики: `RSS max/final`, `externalMax`, `arrayBuffersMax`, `rssOtherApprox` в выводе bench, major/minor GC.
- Профиль: `external-pressure` или `mixed` в Docker (`MODE=docker`).
- Флаги для гипотез: heap preset (`--max-old-space-size`), при Buffer-трафике смотреть приложение; V8 флаги не заменяют учёт native памяти.

**Частые паузы / много minor GC, короткоживущие объекты**

- Область: New Space / Scavenger.
- Метрики: `minor GC`, `new_space` peak в JSON, `heapTotalMax`, latency p95 в bench.
- Профиль: `new-space-pressure`.
- Флаги: `--max-semi-space-size`, `--semi-space-growth-factor`, `--scavenger-max-new-space-capacity-mb`, `--lazy-new-space-shrinking` (смотри recovery и tradeoff в повторах).

**Рост долгоживущих объектов, promotion, old space**

- Область: Old Space.
- Метрики: `old_space` peak, `major GC`, `heapMax`, OOM в manifest.
- Профиль: `old-space-pressure`.
- Флаги: `--max-old-space-size`, `--initial-old-space-size`, heap preset; `--memory-reducer*` после нагрузки и idle.

**После пика память не возвращается**

- Область: idle shrinking, committed heap.
- Метрики: `RSS final` vs `RSS max`, `heapTotalFinal` vs `heapTotalMax`, final vs peak в heap spaces.
- Профиль: `idle-recovery`.
- Флаги: `--memory-reducer`, `--lazy-new-space-shrinking`, `--memory-balancer` (осторожно, экспериментально).

**Нужно объяснить поведение GC / balancer, не «уйти быстрее»**

- Используй `--trace-memory-balancer`, `--predictable-gc-schedule` только как diagnostic; не сравнивай RSS/time с чистыми прогонами.

Подробная спецификация расширения: [`docs/superpowers/specs/2026-05-01-v8-flags-lab-expansion-design.md`](../docs/superpowers/specs/2026-05-01-v8-flags-lab-expansion-design.md).

Полезные эксперименты:

```bash
node run-experiment.js max-old-space-size
node run-experiment.js max-semi-space-size
node run-experiment.js initial-old-space-size
node run-experiment.js lazy-new-space-shrinking
node run-experiment.js semi-space-growth-factor
node run-experiment.js scavenger-max-new-space-capacity-mb
node run-experiment.js memory-reducer
node run-experiment.js memory-reducer-small-heaps
node run-experiment.js memory-balancer
node run-experiment.js memory-balancer-c-value
node run-experiment.js predictable-gc-schedule
```

Диагностический режим:

```bash
node run-experiment.js trace-memory-balancer
```

## Docker режим

Docker нужен, чтобы смотреть V8 внутри cgroup memory limit. Это близко к важной части k8s: container memory limit, OOM, разница между V8 heap и RSS. Это не заменяет k8s scheduler, probes, eviction и pod lifecycle.

Sync experiment в Docker:

```bash
cd v8-flags-lab

MODE=docker MEMORY_LIMIT=512m REPEATS=5 node run-experiment.js heap-preset
node compare-runs.js results/<run-id>/heap-preset
```

Async scenario в Docker Compose:

```bash
cd v8-flags-lab

MEMORY_LIMIT=512m DURATION_S=30 WARMUP_S=5 docker compose up --build --abort-on-container-exit
node compare-runs.js results/compose
```

Async service phase experiment manually:

```bash
# Terminal 1
PORT=3000 OUT=results/async-phase/default/run-001.json LABEL=default \
WARMUP_S=5 STEADY_S=20 SPIKE_S=10 IDLE_S=10 \
RETAIN_CACHE=1 CACHE_LIMIT=1000 \
node async-http-server.js

# Terminal 2
URL=http://localhost:3000/mixed DURATION_S=35 CONCURRENCY=50 node load-client.js

node compare-runs.js results/async-phase
```

## Workload параметры

`sync-data-bench.js`:

- `PRESSURE_PROFILE=mixed|new-space-pressure|old-space-pressure|external-pressure|idle-recovery`
- `WORKLOAD=mixed|json|string|buffer`
- `ITERATIONS=2000`
- `STEADY_ITERATIONS=2000`
- `WARMUP_ITERATIONS=200`
- `PAYLOAD_SIZE=50000`
- `RETAIN_EVERY=50`
- `RETAIN_LIMIT=300`
- `RETAIN_OBJECTS=2`
- `IDLE_S=5`
- `YIELD_EVERY=25`
- `SPIKE_ITERATIONS`: spike-фаза с усиленным retention
- `OUT=results/run.json`
- `LABEL=my-run`

`async-http-server.js`:

- `WARMUP_S=5`
- `STEADY_S=20`
- `SPIKE_S=10`
- `IDLE_S=10`
- `DURATION_S=30` (legacy fallback for `STEADY_S`)
- `MIX_PATTERN=small,small,small,large,buffer`
- `RETAIN_CACHE=1`
- `CACHE_LIMIT=300`
- `OUT=results/async.json`
- `LABEL=my-run`

## Что смотреть

Главные memory-метрики:

- `RSS max`: пиковая память процесса, ближе всего к container limit.
- `RSS final`: что осталось после нагрузки и idle-фазы.
- `heapMax`: пиковый JS heap used.
- `heapTotalMax`: сколько heap V8 зарезервировал/держал.
- `externalMax`: Buffer/native memory вне JS heap.
- `arrayBuffersMax`: вклад ArrayBuffer/Buffer.
- `rssOtherApprox` (RSS − heapTotal − external): грубый «прочий» RSS, не точная разбивка V8.
- `heapSpaces` в JSON: пиковые `usedMax` по `new_space`, `old_space`, `large_object_space`, и т.д.
- `major/minor GC`: давление на Old/New Space.
- `gcRatio`: сколько времени ушло в GC относительно времени прогона.

`compare-runs.js` агрегирует повторы: медианы, Δ к baseline (`default` или `balancer-default-c`), колонки old/new space (если есть в JSON), блок Verdict, `Phase summaries` и предупреждения о слабых данных или trace-флагах.

```bash
node compare-runs.js results/<run-id>/<experiment>
```

## Эмпирическая матрица

Полная strong-матрица: пары `experiment` × `PRESSURE_PROFILE`, длительные фазы и `REPEATS=7` по умолчанию задаются в `v8-flags-lab/lib/evidence-model.js` (`STRONG_MATRIX`, `STRONG_SYNC_ENV`). Запуск всех ячеек и запись сводного manifest:

```bash
cd v8-flags-lab

MATRIX_RUN_ID=strong-$(date +%Y%m%d-%H%M%S) node run-strong-matrix.js
```

`MATRIX_SKIP_ANALYZE=1` отключает пост-анализ по каждой ячейке. Итог лежит в `results/<MATRIX_RUN_ID>/matrix-manifest.json`.

`analyze-runs.js` читает дерево `results/.../<experiment>/<label>/run-*.json`, строит bootstrap CI для разницы медиан variant−baseline по ключевым метрикам и выдаёт decision label (`recommended`, `conditional`, `not_recommended`, `no_visible_effect`, `inconclusive`, `diagnostic_only`). Классификация учитывает `metadata.pressureProfile` (например `external-pressure`).

```bash
node analyze-runs.js results/<run-id>/<experiment>

ANALYZE_BOOTSTRAP_B=5000 node analyze-runs.js results/<run-id>/<experiment> --json
```

Если в одной строке через `&&` сначала задаёшь `RUN_ID=...` только перед `node run-experiment.js`, эта переменная не попадёт во вторую команду: сделай `export RUN_ID=...` до прогона или передай полный путь к `results/.../<experiment>` в `analyze-runs.js`.

`v8-memory-conference-report.canvas.tsx` и любые процентные формулировки в докладе лучше обновлять после появления JSON из `--json` или из `matrix-manifest.json`.

## Карточки флагов

### `--max-old-space-size`

Тип: `single-factor`.

Что изучаем: лимит Old Space. В Docker важно оставлять запас между old space и container memory limit, потому что RSS включает `external`, `arrayBuffers`, code space, stack и native overhead.

Сигнал: `heapMax`, `major GC`, OOM/exit status, headroom до RSS limit.

### `--max-semi-space-size`

Тип: `single-factor`.

Что изучаем: размер одного semi-space. New Space состоит из двух semi-space, поэтому реальный envelope больше одного значения флага.

Сигнал: `minor GC`, `heapTotalMax`, `RSS max/final`.

### `--lazy-new-space-shrinking`

Тип: `single-factor`.

Что изучаем: lazy strategy для уменьшения New Space после пиков.

Лучший workload: `spike -> steady -> idle`, то есть `IDLE_S > 0`.

Сигнал: падают ли `heapTotalFinal` и `RSS final` после пика, меняется ли количество minor GC.

### `--scavenger-max-new-space-capacity-mb`

Тип: `single-factor`.

Что изучаем: верхний предел New Space capacity при Scavenger. Это соседний слой к `--max-semi-space-size`: вместо прямого semi-space limit проверяем внутренний лимит capacity для Scavenger.

Сигнал: `minor GC`, `heapTotalMax`, `RSS max/final`. Если флаг работает на текущей версии Node/V8, маленькие значения должны чаще гонять minor GC и держать ниже `heapTotal`.

### `--memory-reducer` и `--memory-reducer-for-small-heaps`

Тип: `single-factor`.

Что изучаем: насколько V8 пытается уменьшать footprint после нагрузки и в idle. `memory-reducer-for-small-heaps` особенно интересен в Docker с `256m/384m/512m`.

Сигнал: `RSS final`, `heapTotalFinal`, major GC в idle-фазе.

### `--memory-balancer`

Тип: `single-factor`.

Что изучаем: экспериментальный heap limit balancing algorithm. Не смешивать с `memory-reducer`, `predictable-gc-schedule` и heap presets в одном выводе.

Сигнал: `heapTotalMax`, `RSS max`, `gcRatio`, major/minor balance.

### `--memory-balancer-c-value`

Тип: `single-factor`, но baseline должен включать `--memory-balancer`.

Runner сравнивает `--memory-balancer` против `--memory-balancer --memory-balancer-c-value=<x>`. Это меняет только параметр balancer-а, а не сам факт его включения.

Сигнал: меняется ли компромисс между ростом heap и GC pressure.

### `--trace-memory-balancer`

Тип: `diagnostic`.

Использовать для объяснения решений balancer-а. Не использовать как чистое сравнение RSS/time, потому что trace может давать overhead.

### `--predictable-gc-schedule`

Тип: `single-factor`.

Что изучаем: предсказуемый GC schedule, который фиксирует heap growing, idle и memory reducing behavior.

Это не production-рекомендация, а контрольный режим для воспроизводимости и объяснения механики.

## Что не делать

- Не делать вывод по одному прогону.
- Не смешивать `single-factor` и `preset` в одном утверждении.
- Не сравнивать `trace-*` режимы с чистыми benchmark-прогонами как равные.
- Не менять Docker memory limit и V8 flag одновременно, если эксперимент не помечен как отдельный preset.
- Не считать `heapUsed` всей памятью процесса: для контейнера критичнее `RSS`.
