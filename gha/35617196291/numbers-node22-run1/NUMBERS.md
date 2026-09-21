# Числа прогона gha-node22-run1

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:11:23Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.28** (0.27–0.29) · B: **1.39** (1.39–1.4) · **×5.0** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.39** (1.38–1.39)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.42** (1.39–1.47)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.27–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.27–0.32)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1153.6** → Sparkplug **790.9** → Maglev **792.2** → TurboFan **94.5** · Ignition/TurboFan **×12.2**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 4943–5304

## A/B под --turbolev
- флага в этой версии V8 нет

## wrong map (5 прогонов demo-wrongmap + прибор)
- analyzer-ref-b (sfi: 1
- ref-a normalizeUser TURBOFAN: 5
- ref-b normalizeUser TURBOFAN: 5
- ref-b score TURBOFAN: 5

## --log-ic: читатель score, поле plan (old→new)
- ref-a: 0→1
- ref-b: 0→1 · 1→P · P→P · P→P · P→N · N→N · N→N · N→N

## Пайплайн (медианы 5 повторов), B относительно A
- ячеек 150 · чексумма совпала во всех: true

### guard-llm / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.18 | ×0.94 | ×4.84 | ×1.23 | 73% → 62% |
| 500 | 5 | ×1.66 | ×0.94 | ×5.00 | ×1.24 | 63% → 39% |
| 500 | 20 | ×2.72 | ×0.97 | ×4.99 | ×1.28 | 43% → 16% |
| 5000 | 1 | ×1.19 | ×0.91 | ×4.71 | ×1.35 | 73% → 62% |
| 5000 | 5 | ×1.67 | ×0.92 | ×4.64 | ×1.35 | 63% → 38% |
| 5000 | 20 | ×2.56 | ×0.93 | ×4.10 | ×1.32 | 39% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.23 | ×1.62 | ×4.89 | ×1.22 | 74% → 61% |
| 500 | 5 | ×1.77 | ×1.62 | ×5.33 | ×1.26 | 64% → 37% |
| 500 | 20 | ×2.81 | ×1.62 | ×5.06 | ×1.28 | 43% → 16% |
| 5000 | 1 | ×1.27 | ×1.63 | ×4.87 | ×1.36 | 75% → 61% |
| 5000 | 5 | ×1.71 | ×1.61 | ×4.93 | ×1.32 | 63% → 37% |
| 5000 | 20 | ×2.59 | ×1.64 | ×4.11 | ×1.31 | 39% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.04 | ×1.11 | ×1.37 | ×1.02 | 73% → 72% |
| 500 | 5 | ×1.08 | ×1.11 | ×1.41 | ×1.02 | 63% → 59% |
| 500 | 20 | ×1.21 | ×1.11 | ×1.48 | ×1.02 | 43% → 36% |
| 5000 | 1 | ×1.03 | ×1.07 | ×1.29 | ×1.02 | 73% → 73% |
| 5000 | 5 | ×1.08 | ×1.11 | ×1.31 | ×1.03 | 63% → 60% |
| 5000 | 20 | ×1.16 | ×1.11 | ×1.31 | ×1.03 | 39% → 33% |

- абсолют batch=500 R=1, мс: mono-llm 0.515 · guard-llm 0.608

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **736 rps** · p50 65 мс · p99 131 мс · errors 0
- guard-llm: **462 rps** · p50 105 мс · p99 210 мс · errors 0
- mixed-mono: **689 rps** · p50 70 мс · p99 140 мс · errors 0
- mono/guard **×1.59** · p99 +60% · mixed к mono -6%

## Мифы (медианы 5 повторов), мс
- delete/delete: 104.5 (104.4–113.8)
- delete/fast: 3.1 (3.1–3.2)
- delete/undefined: 3.2 (3.1–3.2)
- elements/DOUBLE: 18.5 (18.4–18.7)
- elements/ELEMENTS: 13.6 (13.3–13.9)
- elements/HOLEY: 13.6 (13–14.3)
- elements/SMI: 13.1 (13–13.4)
- ic/1-shapes: 21.6 (21.3–22.2)
- ic/2-shapes: 23.4 (23.4–23.9)
- ic/4-shapes: 34.6 (28.6–36.7)
- ic/8-shapes: 91.9 (91.4–103.1)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (58–59)
- trycatch/naive-try: 165 (164–165)

- IC 8 форм / 1: **×4.25** · 4 формы / 1: ×1.60
- delete / fast: **×33.7** · undefined / fast: ×1.03
- try/catch наивный: ×2.84 · изолированный: 58 = 58
- HOLEY / SMI: ×1.04 · DOUBLE / SMI: ×1.41
