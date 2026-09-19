# Числа прогона gha-node24-run2

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-19T21:28:23Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.3** (0.29–0.3) · B: **1.33** (1.33–1.35) · **×4.4** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.34** (1.34–1.35)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.36** (1.34–1.39)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.28–0.3)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.3** (0.29–0.32)
- без правил / с правилами: **×4.7**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1051.2** → Sparkplug **787.2** → Maglev **151.2** → TurboFan **90.6** · Ignition/TurboFan **×11.6**
- на каком вызове ярус (5 прогонов): Sparkplug 607–659 · Maglev 922–1000 · TurboFan 13079–13486

## A/B под --turbolev
- A **0.3** · B **1.4** · **×4.7**

## wrong map (5 прогонов demo-wrongmap + прибор)
- analyzer-ref-b (sfi: 1
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
| 500 | 1 | ×1.21 | ×0.97 | ×4.43 | ×1.23 | 66% → 55% |
| 500 | 5 | ×1.72 | ×0.97 | ×4.59 | ×1.24 | 55% → 32% |
| 500 | 20 | ×2.73 | ×0.97 | ×4.48 | ×1.25 | 35% → 13% |
| 5000 | 1 | ×1.25 | ×0.95 | ×4.62 | ×1.36 | 69% → 56% |
| 5000 | 5 | ×1.80 | ×0.96 | ×4.67 | ×1.36 | 58% → 32% |
| 5000 | 20 | ×2.83 | ×0.98 | ×4.68 | ×1.37 | 36% → 13% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.27 | ×1.67 | ×4.48 | ×1.22 | 67% → 54% |
| 500 | 5 | ×1.78 | ×1.61 | ×4.56 | ×1.23 | 56% → 32% |
| 500 | 20 | ×2.75 | ×1.57 | ×4.45 | ×1.24 | 36% → 13% |
| 5000 | 1 | ×1.27 | ×1.64 | ×4.56 | ×1.37 | 71% → 55% |
| 5000 | 5 | ×1.86 | ×1.64 | ×4.64 | ×1.37 | 59% → 33% |
| 5000 | 20 | ×2.88 | ×1.52 | ×4.67 | ×1.38 | 36% → 13% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.04 | ×1.08 | ×1.33 | ×1.02 | 66% → 65% |
| 500 | 5 | ×1.07 | ×1.08 | ×1.35 | ×1.02 | 55% → 52% |
| 500 | 20 | ×1.19 | ×1.08 | ×1.36 | ×1.01 | 35% → 30% |
| 5000 | 1 | ×1.03 | ×1.06 | ×1.38 | ×1.01 | 69% → 67% |
| 5000 | 5 | ×1.08 | ×1.09 | ×1.37 | ×1.01 | 58% → 53% |
| 5000 | 20 | ×1.18 | ×1.08 | ×1.36 | ×1.01 | 36% → 30% |

- абсолют batch=500 R=1, мс: mono-llm 0.435 · guard-llm 0.527

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **870 rps** · p50 55 мс · p99 108 мс · errors 0
- guard-llm: **515 rps** · p50 94 мс · p99 185 мс · errors 0
- mixed-mono: **798 rps** · p50 61 мс · p99 118 мс · errors 0
- mono/guard **×1.69** · p99 +71% · mixed к mono -8%

## Мифы (медианы 5 повторов), мс
- delete/delete: 110.9 (110.9–111.1)
- delete/fast: 2.9 (2.9–2.9)
- delete/undefined: 2.9 (2.9–2.9)
- elements/DOUBLE: 19.9 (19.9–19.9)
- elements/ELEMENTS: 11.8 (11.7–11.8)
- elements/HOLEY: 11.7 (11.7–11.8)
- elements/SMI: 10.7 (10.6–10.8)
- ic/1-shapes: 27.1 (26.9–27.2)
- ic/2-shapes: 30.7 (30.3–31.7)
- ic/4-shapes: 42 (39–44)
- ic/8-shapes: 104.6 (104.3–104.9)
- trycatch/honest-plain: 50 (50–50)
- trycatch/honest-try: 50 (50–51)
- trycatch/naive-plain: 62 (62–62)
- trycatch/naive-try: 171 (171–171)

- IC 8 форм / 1: **×3.86** · 4 формы / 1: ×1.55
- delete / fast: **×38.2** · undefined / fast: ×1.00
- try/catch наивный: ×2.76 · изолированный: 50 = 50
- HOLEY / SMI: ×1.09 · DOUBLE / SMI: ×1.86
