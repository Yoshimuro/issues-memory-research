# Числа прогона gha-node24-run2

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:11:25Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.26** (0.25–0.28) · B: **1.38** (1.37–1.39) · **×5.3** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.38** (1.37–1.41)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.37–1.41)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.25–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.26–0.31)
- без правил / с правилами: **×4.9**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1098.5** → Sparkplug **819.5** → Maglev **140.1** → TurboFan **83.1** · Ignition/TurboFan **×13.2**
- на каком вызове ярус (5 прогонов): Sparkplug 614–672 · Maglev 827–993 · TurboFan 12586–13367

## A/B под --turbolev
- A **0.27** · B **1.59** · **×5.9**

## wrong map (5 прогонов demo-wrongmap + прибор)
- analyzer-ref-b (sfi: 2
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
| 500 | 1 | ×1.23 | ×0.94 | ×5.17 | ×1.24 | 68% → 57% |
| 500 | 5 | ×1.76 | ×0.92 | ×5.20 | ×1.25 | 59% → 33% |
| 500 | 20 | ×2.98 | ×0.94 | ×5.24 | ×1.27 | 38% → 13% |
| 5000 | 1 | ×1.24 | ×0.92 | ×4.95 | ×1.39 | 70% → 57% |
| 5000 | 5 | ×1.82 | ×0.92 | ×5.11 | ×1.38 | 60% → 33% |
| 5000 | 20 | ×3.01 | ×0.96 | ×5.22 | ×1.38 | 38% → 13% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.26 | ×1.72 | ×5.22 | ×1.24 | 70% → 55% |
| 500 | 5 | ×1.79 | ×1.72 | ×5.24 | ×1.23 | 60% → 34% |
| 500 | 20 | ×2.97 | ×1.65 | ×5.22 | ×1.25 | 40% → 13% |
| 5000 | 1 | ×1.29 | ×1.73 | ×5.01 | ×1.38 | 72% → 56% |
| 5000 | 5 | ×1.88 | ×1.78 | ×5.14 | ×1.39 | 61% → 33% |
| 5000 | 20 | ×3.05 | ×1.63 | ×5.13 | ×1.39 | 39% → 13% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.11 | ×1.33 | ×1.04 | 68% → 66% |
| 500 | 5 | ×1.08 | ×1.11 | ×1.37 | ×1.04 | 59% → 55% |
| 500 | 20 | ×1.20 | ×1.14 | ×1.41 | ×1.05 | 38% → 33% |
| 5000 | 1 | ×1.03 | ×1.07 | ×1.31 | ×1.03 | 70% → 69% |
| 5000 | 5 | ×1.07 | ×1.10 | ×1.32 | ×1.03 | 60% → 56% |
| 5000 | 20 | ×1.16 | ×1.08 | ×1.33 | ×1.03 | 38% → 33% |

- абсолют batch=500 R=1, мс: mono-llm 0.44 · guard-llm 0.54

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **862 rps** · p50 56 мс · p99 111 мс · errors 0
- guard-llm: **505 rps** · p50 96 мс · p99 191 мс · errors 0
- mixed-mono: **818 rps** · p50 59 мс · p99 117 мс · errors 0
- mono/guard **×1.71** · p99 +72% · mixed к mono -5%

## Мифы (медианы 5 повторов), мс
- delete/delete: 106 (105.9–109.2)
- delete/fast: 2.6 (2.5–2.6)
- delete/undefined: 2.6 (2.5–2.6)
- elements/DOUBLE: 17.8 (17.8–17.8)
- elements/ELEMENTS: 10.4 (10.4–11.1)
- elements/HOLEY: 10.4 (10.3–10.4)
- elements/SMI: 8 (7.9–8)
- ic/1-shapes: 25.5 (25.3–25.9)
- ic/2-shapes: 30.4 (30.3–31.7)
- ic/4-shapes: 39.8 (39.2–40.7)
- ic/8-shapes: 94.1 (93.9–94.3)
- trycatch/honest-plain: 47 (47–47)
- trycatch/honest-try: 47 (47–47)
- trycatch/naive-plain: 57 (56–58)
- trycatch/naive-try: 159 (159–160)

- IC 8 форм / 1: **×3.69** · 4 формы / 1: ×1.56
- delete / fast: **×40.8** · undefined / fast: ×1.00
- try/catch наивный: ×2.79 · изолированный: 47 = 47
- HOLEY / SMI: ×1.30 · DOUBLE / SMI: ×2.23
