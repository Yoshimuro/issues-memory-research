# V8 для самых маленьких: что за лев этот турболев?

Александр Зайцев · HolyJS 2026 Autumn

**[Финальная презентация — PDF, 71 страница](final.pdf)**

Здесь находятся финальные слайды и примеры, на которых основаны эксперименты доклада.

## Быстрый запуск

Для локальных примеров нужен Node.js 24. Для полного прогона — запущенный Docker.

```sh
git clone https://github.com/Yoshimuro/issues-memory-research.git
cd issues-memory-research/holy2026-autumn/v8-experiment

# Одна форма объекта у A, несколько форм у B
node --allow-natives-syntax lab/demo-samemap.js

# Измерение A и B; correct подтверждает контрольную сумму
node --allow-natives-syntax lab/shape-analyzer.js lab/ref-a.js
node --allow-natives-syntax lab/shape-analyzer.js lab/ref-b.js

# Деоптимизация читателя при смене формы
node --allow-natives-syntax --trace-deopt lab/demo-wrongmap.js lab/ref-b.js

# Журнал IC; ic.log создаётся локально
node --allow-natives-syntax --log-ic --no-logfile-per-isolate \
  --logfile=ic.log lab/shape-analyzer.js lab/ref-b.js
```

Полная матрица в контейнере: 60 сохранённых генераций, эталонные реализации, ярусы, мифы, пайплайн и HTTP-бенчмарк. Нужны сеть для первой сборки и время на последовательные замеры.

```sh
./docker/run.sh 24 'bash docker/verify.sh my-run && node docker/report.js docker/out/my-run'
```

Отчёт появится в `v8-experiment/docker/out/my-run/NUMBERS.md`. Для контрольного прогона Node.js 22 замените `24` на `22`. Используются закреплённые образы `node:24.21.0-alpine` и `node:22.23.2-alpine`; контейнер ограничен двумя CPU. Время выполнения зависит от машины и нагрузки.

## Что где лежит

| Путь | Содержание |
| --- | --- |
| `final.pdf` | Единственная версия слайдов в текущем дереве файлов |
| `v8-experiment/lab/ref-a.js`, `ref-b.js` | Сравниваемые реализации |
| `v8-experiment/lab/shape-analyzer.js` | Подсчёт форм, проверка результата и замер читателя |
| `v8-experiment/lab/demo-*.js` | Демонстрации одинаковой формы и `wrong map` |
| `v8-experiment/lab/out/*/candidate_*.js` | 60 входных программ для повторного измерения; это данные эксперимента, не временные логи |
| `v8-experiment/lab/prompts/`, `v8-rules.md` | Промпты и правила исходного эксперимента |
| `v8-experiment/lab/real/` | Пайплайн, HTTP-сервер и детерминированный генератор данных |
| `v8-experiment/demos/myths/` | Примеры про IC, массивы, `delete` и `try/catch` |
| `v8-experiment/docker/` | Окружение, единый прогон, отчёт и измерения ярусов |
| `v8-experiment/docker/results/` | Зафиксированные сводки замеров для доклада |
| `v8-experiment/PITFALLS.md` | Ограничения измерений и ошибки интерпретации |

Рядом с экспериментами оставлены небольшие исходные JSONL и отчёты `RESULTS*.md`: они позволяют проверить происхождение опубликованных чисел. Исторические результаты разных версий Node/V8 и разных архитектур не объединяются в одну выборку.

Скрипты `lab/run-experiment.sh` и `lab/drive-all.sh` нужны только для **новых** генераций через Claude CLI. Для повторного измерения сохранённых 60 программ Claude не нужен. Старый `demos/myths/run-matrix.sh` рассчитан на лабораторные пути `/opt/node*` и установленный d8; переносимый вход для Node 22/24 — `docker/run.sh`.

## Проверка на GitHub

Workflow `holy2026-autumn-verify` запускается вручную через Actions. Отчёты и сырые данные сохраняются в Actions Artifacts на 14 дней. Workflow не записывает результаты обратно в Git-ветки.

## Происхождение

Код примеров взят из `claude/compiler-turbofan-selection-076o1v`, коммит `cc3a31417f7c7a949cb8e4c0528e6778245119aa`: он содержит исправления экспериментальной части поверх `v8-talk-verify`.

PDF соответствует локальному экспорту `final.final.pdf` от 23 октября 2026 года. SHA-256: `704897b67a5f821577960c8b4bfc900d4af005e90238e3670132af3a68244163`.

QR в PDF ведёт в историческую ветку `v8-talk-verify`. Новые материалы находятся в этой папке; для старой ссылки сохраняется указатель на новый сезон.
