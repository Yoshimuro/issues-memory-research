# Числа прогона gha-node22-run1

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:19:05Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.27** (0.25–0.29) · B: **1.39** (1.38–1.39) · **×5.1** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.39** (1.38–1.42)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.42** (1.38–1.71)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.26–0.28)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.27–0.32)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1136.2** → Sparkplug **786.8** → Maglev **786.9** → TurboFan **92.3** · Ignition/TurboFan **×12.3**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 5028–5274

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
| 500 | 1 | ×1.17 | ×0.94 | ×5.06 | ×1.23 | 73% → 62% |
| 500 | 5 | ×1.67 | ×0.94 | ×5.05 | ×1.23 | 63% → 39% |
| 500 | 20 | ×2.72 | ×0.94 | ×5.06 | ×1.26 | 44% → 16% |
| 5000 | 1 | ×1.19 | ×0.92 | ×4.52 | ×1.35 | 73% → 61% |
| 5000 | 5 | ×1.65 | ×0.90 | ×4.59 | ×1.33 | 63% → 38% |
| 5000 | 20 | ×2.58 | ×0.92 | ×4.22 | ×1.31 | 39% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.23 | ×1.64 | ×5.17 | ×1.23 | 74% → 60% |
| 500 | 5 | ×1.78 | ×1.68 | ×5.52 | ×1.23 | 65% → 37% |
| 500 | 20 | ×2.87 | ×1.68 | ×5.26 | ×1.24 | 44% → 16% |
| 5000 | 1 | ×1.26 | ×1.66 | ×4.91 | ×1.37 | 75% → 60% |
| 5000 | 5 | ×1.76 | ×1.61 | ×5.13 | ×1.34 | 65% → 37% |
| 5000 | 20 | ×2.64 | ×1.64 | ×4.27 | ×1.31 | 40% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.11 | ×1.39 | ×1.01 | 73% → 71% |
| 500 | 5 | ×1.07 | ×1.11 | ×1.41 | ×1.01 | 63% → 59% |
| 500 | 20 | ×1.19 | ×1.09 | ×1.46 | ×1.04 | 44% → 36% |
| 5000 | 1 | ×1.02 | ×1.11 | ×1.29 | ×1.01 | 73% → 72% |
| 5000 | 5 | ×1.07 | ×1.08 | ×1.30 | ×1.02 | 63% → 60% |
| 5000 | 20 | ×1.16 | ×1.12 | ×1.31 | ×1.02 | 39% → 34% |

- абсолют batch=500 R=1, мс: mono-llm 0.509 · guard-llm 0.597

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **763 rps** · p50 63 мс · p99 126 мс · errors 0
- guard-llm: **472 rps** · p50 103 мс · p99 205 мс · errors 0
- mixed-mono: **701 rps** · p50 69 мс · p99 138 мс · errors 0
- mono/guard **×1.61** · p99 +63% · mixed к mono -8%

## Мифы (медианы 5 повторов), мс
- delete/delete: 104.4 (104.4–112.6)
- delete/fast: 3.1 (3.1–3.2)
- delete/undefined: 3.2 (3.2–3.2)
- elements/DOUBLE: 18.6 (18.5–18.7)
- elements/ELEMENTS: 14 (13.3–14.6)
- elements/HOLEY: 13.3 (13–14.2)
- elements/SMI: 13.9 (13–14.2)
- ic/1-shapes: 21.7 (21.3–21.9)
- ic/2-shapes: 23 (22.9–23.4)
- ic/4-shapes: 34.8 (31.5–37)
- ic/8-shapes: 91.4 (91.3–91.6)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (57–59)
- trycatch/naive-try: 164 (164–169)

- IC 8 форм / 1: **×4.21** · 4 формы / 1: ×1.60
- delete / fast: **×33.7** · undefined / fast: ×1.03
- try/catch наивный: ×2.83 · изолированный: 58 = 58
- HOLEY / SMI: ×0.96 · DOUBLE / SMI: ×1.34
