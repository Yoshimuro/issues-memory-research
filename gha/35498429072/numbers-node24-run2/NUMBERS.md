# Числа прогона gha-node24-run2

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-20T08:01:54Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.29** (0.26–0.29) · B: **1.38** (1.37–1.4) · **×4.8** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.38** (1.37–1.39)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.38–1.42)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.27** (0.25–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.25–0.31)
- без правил / с правилами: **×5.1**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1095.7** → Sparkplug **819.9** → Maglev **140.1** → TurboFan **82.5** · Ignition/TurboFan **×13.3**
- на каком вызове ярус (5 прогонов): Sparkplug 613–685 · Maglev 813–991 · TurboFan 12555–13606

## A/B под --turbolev
- A **0.27** · B **1.58** · **×5.9**

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
| 500 | 1 | ×1.21 | ×0.94 | ×5.39 | ×1.24 | 69% → 56% |
| 500 | 5 | ×1.78 | ×0.94 | ×5.32 | ×1.23 | 59% → 33% |
| 500 | 20 | ×3.01 | ×0.94 | ×5.28 | ×1.26 | 38% → 13% |
| 5000 | 1 | ×1.22 | ×0.94 | ×4.96 | ×1.38 | 71% → 57% |
| 5000 | 5 | ×1.79 | ×0.92 | ×5.10 | ×1.38 | 59% → 33% |
| 5000 | 20 | ×2.98 | ×0.95 | ×5.13 | ×1.39 | 38% → 13% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.26 | ×1.72 | ×5.17 | ×1.25 | 70% → 55% |
| 500 | 5 | ×1.83 | ×1.76 | ×5.35 | ×1.25 | 60% → 34% |
| 500 | 20 | ×2.99 | ×1.69 | ×5.20 | ×1.26 | 40% → 13% |
| 5000 | 1 | ×1.28 | ×1.72 | ×5.03 | ×1.39 | 72% → 56% |
| 5000 | 5 | ×1.87 | ×1.71 | ×5.04 | ×1.38 | 61% → 33% |
| 5000 | 20 | ×2.98 | ×1.61 | ×5.10 | ×1.40 | 39% → 13% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.02 | ×1.11 | ×1.33 | ×1.02 | 69% → 66% |
| 500 | 5 | ×1.08 | ×1.11 | ×1.40 | ×1.04 | 59% → 55% |
| 500 | 20 | ×1.18 | ×1.11 | ×1.35 | ×1.04 | 38% → 33% |
| 5000 | 1 | ×1.02 | ×1.10 | ×1.34 | ×1.03 | 71% → 68% |
| 5000 | 5 | ×1.06 | ×1.08 | ×1.32 | ×1.03 | 59% → 56% |
| 5000 | 20 | ×1.16 | ×1.08 | ×1.32 | ×1.03 | 38% → 34% |

- абсолют batch=500 R=1, мс: mono-llm 0.442 · guard-llm 0.535

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **865 rps** · p50 55 мс · p99 109 мс · errors 0
- guard-llm: **506 rps** · p50 96 мс · p99 191 мс · errors 0
- mixed-mono: **819 rps** · p50 59 мс · p99 116 мс · errors 0
- mono/guard **×1.71** · p99 +75% · mixed к mono -5%

## Мифы (медианы 5 повторов), мс
- delete/delete: 106.3 (106.1–109)
- delete/fast: 2.5 (2.5–2.6)
- delete/undefined: 2.6 (2.5–2.6)
- elements/DOUBLE: 17.8 (17.8–17.8)
- elements/ELEMENTS: 10.4 (10.3–10.4)
- elements/HOLEY: 10.4 (10.4–12.6)
- elements/SMI: 8 (8–8)
- ic/1-shapes: 25.6 (25.4–25.8)
- ic/2-shapes: 30.9 (30.3–31.6)
- ic/4-shapes: 40.1 (39.2–40.4)
- ic/8-shapes: 94.4 (94.4–97.7)
- trycatch/honest-plain: 47 (47–48)
- trycatch/honest-try: 47 (47–47)
- trycatch/naive-plain: 57 (56–58)
- trycatch/naive-try: 159 (158–162)

- IC 8 форм / 1: **×3.69** · 4 формы / 1: ×1.57
- delete / fast: **×42.5** · undefined / fast: ×1.04
- try/catch наивный: ×2.79 · изолированный: 47 = 47
- HOLEY / SMI: ×1.30 · DOUBLE / SMI: ×2.23
