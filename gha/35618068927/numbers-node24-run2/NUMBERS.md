# Числа прогона gha-node24-run2

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:19:11Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.12** (0.12–0.12) · B: **0.8** (0.78–0.82) · **×6.7** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **0.8** (0.79–0.84)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **0.81** (0.8–0.83)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.12** (0.12–0.13)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.12** (0.12–0.13)
- без правил / с правилами: **×6.8**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **559.5** → Sparkplug **427** → Maglev **82.9** → TurboFan **51.4** · Ignition/TurboFan **×10.9**
- на каком вызове ярус (5 прогонов): Sparkplug 607–680 · Maglev 1023–1143 · TurboFan 13704–14383

## A/B под --turbolev
- A **0.15** · B **0.98** · **×6.5**

## wrong map (5 прогонов demo-wrongmap + прибор)
- ref-a normalizeUser TURBOFAN_JS: 5
- ref-b normalizeUser TURBOFAN_JS: 5
- ref-b score TURBOFAN_JS: 5

## --log-ic: читатель score, поле plan (old→new)
- ref-a: 0→1
- ref-b: 0→1 · 1→P · P→P · P→P · P→N · N→N · N→N · N→N

## Пайплайн (медианы 5 повторов), B относительно A
- ячеек 150 · чексумма совпала во всех: true

### guard-llm / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.19 | ×0.95 | ×4.80 | ×1.24 | 67% → 55% |
| 500 | 5 | ×1.72 | ×1.00 | ×4.02 | ×1.31 | 55% → 32% |
| 500 | 20 | ×2.62 | ×1.00 | ×4.11 | ×1.21 | 34% → 13% |
| 5000 | 1 | ×1.19 | ×0.93 | ×4.09 | ×1.36 | 68% → 55% |
| 5000 | 5 | ×1.70 | ×0.95 | ×4.15 | ×1.35 | 57% → 33% |
| 5000 | 20 | ×2.69 | ×0.93 | ×4.23 | ×1.38 | 34% → 13% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.32 | ×1.57 | ×5.00 | ×1.32 | 69% → 55% |
| 500 | 5 | ×1.77 | ×1.64 | ×4.13 | ×1.31 | 56% → 32% |
| 500 | 20 | ×2.79 | ×1.64 | ×4.39 | ×1.33 | 35% → 13% |
| 5000 | 1 | ×1.32 | ×1.57 | ×4.24 | ×1.44 | 70% → 55% |
| 5000 | 5 | ×1.81 | ×1.54 | ×4.32 | ×1.40 | 58% → 32% |
| 5000 | 20 | ×2.74 | ×1.44 | ×4.20 | ×1.40 | 34% → 12% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.16 | ×1.40 | ×1.00 | 67% → 65% |
| 500 | 5 | ×1.06 | ×1.21 | ×1.24 | ×1.04 | 55% → 51% |
| 500 | 20 | ×1.20 | ×1.21 | ×1.34 | ×1.00 | 34% → 29% |
| 5000 | 1 | ×1.01 | ×1.12 | ×1.31 | ×1.00 | 68% → 66% |
| 5000 | 5 | ×1.06 | ×1.15 | ×1.30 | ×0.99 | 57% → 52% |
| 5000 | 20 | ×1.19 | ×1.09 | ×1.34 | ×1.02 | 34% → 29% |

- абсолют batch=500 R=1, мс: mono-llm 0.231 · guard-llm 0.275

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **1613 rps** · p50 29 мс · p99 59 мс · errors 0
- guard-llm: **971 rps** · p50 50 мс · p99 99 мс · errors 0
- mixed-mono: **1488 rps** · p50 32 мс · p99 65 мс · errors 0
- mono/guard **×1.66** · p99 +68% · mixed к mono -8%

## Мифы (медианы 5 повторов), мс
- delete/delete: 58.5 (56.8–62.4)
- delete/fast: 1.4 (1.4–1.4)
- delete/undefined: 1.4 (1.4–1.5)
- elements/DOUBLE: 8.3 (8.3–8.4)
- elements/ELEMENTS: 7.2 (7.2–7.3)
- elements/HOLEY: 7.2 (7.2–7.6)
- elements/SMI: 5.7 (5.7–5.8)
- ic/1-shapes: 17.2 (17.2–17.2)
- ic/2-shapes: 16.7 (16.7–17.1)
- ic/4-shapes: 19.4 (18.9–19.7)
- ic/8-shapes: 53.7 (53.7–55.9)
- trycatch/honest-plain: 23 (23–23)
- trycatch/honest-try: 23 (22–23)
- trycatch/naive-plain: 33 (33–33)
- trycatch/naive-try: 81 (81–86)

- IC 8 форм / 1: **×3.12** · 4 формы / 1: ×1.13
- delete / fast: **×41.8** · undefined / fast: ×1.00
- try/catch наивный: ×2.45 · изолированный: 23 = 23
- HOLEY / SMI: ×1.26 · DOUBLE / SMI: ×1.46
