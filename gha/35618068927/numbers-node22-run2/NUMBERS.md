# Числа прогона gha-node22-run2

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:19:05Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.28** (0.27–0.29) · B: **1.39** (1.38–1.4) · **×5.0** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.39** (1.38–1.41)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.42** (1.39–1.49)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.27** (0.25–0.28)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.25–0.32)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1143.8** → Sparkplug **788.6** → Maglev **789.2** → TurboFan **88.2** · Ignition/TurboFan **×13.0**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 4945–5254

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
| 500 | 5 | ×1.67 | ×0.94 | ×5.00 | ×1.23 | 63% → 39% |
| 500 | 20 | ×2.71 | ×0.97 | ×5.01 | ×1.24 | 43% → 16% |
| 5000 | 1 | ×1.19 | ×0.90 | ×4.70 | ×1.34 | 73% → 62% |
| 5000 | 5 | ×1.65 | ×0.89 | ×4.72 | ×1.34 | 63% → 38% |
| 5000 | 20 | ×2.59 | ×0.98 | ×4.23 | ×1.31 | 39% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.24 | ×1.64 | ×5.17 | ×1.23 | 74% → 60% |
| 500 | 5 | ×1.77 | ×1.58 | ×5.45 | ×1.23 | 65% → 37% |
| 500 | 20 | ×2.82 | ×1.68 | ×5.11 | ×1.25 | 44% → 16% |
| 5000 | 1 | ×1.27 | ×1.67 | ×5.30 | ×1.37 | 75% → 60% |
| 5000 | 5 | ×1.77 | ×1.61 | ×5.26 | ×1.35 | 65% → 36% |
| 5000 | 20 | ×2.66 | ×1.65 | ×4.30 | ×1.31 | 40% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.11 | ×1.44 | ×1.02 | 73% → 71% |
| 500 | 5 | ×1.07 | ×1.11 | ×1.40 | ×1.01 | 63% → 59% |
| 500 | 20 | ×1.20 | ×1.11 | ×1.46 | ×1.01 | 43% → 36% |
| 5000 | 1 | ×1.03 | ×1.09 | ×1.32 | ×1.01 | 73% → 72% |
| 5000 | 5 | ×1.06 | ×1.07 | ×1.31 | ×1.02 | 63% → 59% |
| 5000 | 20 | ×1.15 | ×1.15 | ×1.30 | ×1.01 | 39% → 34% |

- абсолют batch=500 R=1, мс: mono-llm 0.512 · guard-llm 0.601

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **761 rps** · p50 63 мс · p99 127 мс · errors 0
- guard-llm: **463 rps** · p50 105 мс · p99 210 мс · errors 0
- mixed-mono: **708 rps** · p50 67 мс · p99 136 мс · errors 0
- mono/guard **×1.64** · p99 +65% · mixed к mono -7%

## Мифы (медианы 5 повторов), мс
- delete/delete: 104.3 (102.9–104.4)
- delete/fast: 3.1 (3.1–3.2)
- delete/undefined: 3.2 (3.1–3.2)
- elements/DOUBLE: 18.4 (18.3–18.7)
- elements/ELEMENTS: 13.8 (13.1–14.4)
- elements/HOLEY: 13.5 (13.3–14.3)
- elements/SMI: 13.7 (13.2–14.5)
- ic/1-shapes: 21.7 (21.4–21.8)
- ic/2-shapes: 23.4 (23–23.8)
- ic/4-shapes: 34.9 (28.1–36.8)
- ic/8-shapes: 92 (91.6–93)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (58–58)
- trycatch/naive-try: 164 (164–165)

- IC 8 форм / 1: **×4.24** · 4 формы / 1: ×1.61
- delete / fast: **×33.6** · undefined / fast: ×1.03
- try/catch наивный: ×2.83 · изолированный: 58 = 58
- HOLEY / SMI: ×0.99 · DOUBLE / SMI: ×1.34
