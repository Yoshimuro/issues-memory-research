# Числа прогона gha-node22-run3

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:11:34Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.27** (0.27–0.29) · B: **1.38** (1.37–1.39) · **×5.1** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.39** (1.38–1.41)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.42** (1.38–1.44)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.27** (0.27–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.27–0.32)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1135** → Sparkplug **786.9** → Maglev **785.9** → TurboFan **92.4** · Ignition/TurboFan **×12.3**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 5050–5412

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
| 500 | 1 | ×1.19 | ×0.94 | ×4.84 | ×1.25 | 73% → 62% |
| 500 | 5 | ×1.65 | ×0.92 | ×4.97 | ×1.24 | 64% → 39% |
| 500 | 20 | ×2.73 | ×0.97 | ×5.03 | ×1.25 | 43% → 16% |
| 5000 | 1 | ×1.20 | ×0.91 | ×4.79 | ×1.35 | 73% → 62% |
| 5000 | 5 | ×1.64 | ×0.92 | ×4.51 | ×1.33 | 63% → 38% |
| 5000 | 20 | ×2.51 | ×0.93 | ×3.99 | ×1.37 | 38% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.23 | ×1.58 | ×5.22 | ×1.23 | 74% → 61% |
| 500 | 5 | ×1.79 | ×1.68 | ×5.37 | ×1.23 | 64% → 37% |
| 500 | 20 | ×2.85 | ×1.72 | ×5.18 | ×1.28 | 44% → 16% |
| 5000 | 1 | ×1.26 | ×1.66 | ×5.21 | ×1.37 | 75% → 60% |
| 5000 | 5 | ×1.75 | ×1.64 | ×5.07 | ×1.35 | 64% → 37% |
| 5000 | 20 | ×2.66 | ×1.66 | ×4.27 | ×1.32 | 39% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.11 | ×1.37 | ×1.02 | 73% → 71% |
| 500 | 5 | ×1.06 | ×1.08 | ×1.40 | ×1.02 | 64% → 59% |
| 500 | 20 | ×1.20 | ×1.09 | ×1.46 | ×1.01 | 43% → 36% |
| 5000 | 1 | ×1.02 | ×1.11 | ×1.31 | ×1.01 | 73% → 72% |
| 5000 | 5 | ×1.06 | ×1.12 | ×1.26 | ×1.02 | 63% → 59% |
| 5000 | 20 | ×1.12 | ×1.11 | ×1.23 | ×1.00 | 38% → 34% |

- абсолют batch=500 R=1, мс: mono-llm 0.51 · guard-llm 0.606

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **742 rps** · p50 65 мс · p99 130 мс · errors 0
- guard-llm: **466 rps** · p50 104 мс · p99 208 мс · errors 0
- mixed-mono: **700 rps** · p50 69 мс · p99 138 мс · errors 0
- mono/guard **×1.59** · p99 +60% · mixed к mono -6%

## Мифы (медианы 5 повторов), мс
- delete/delete: 104.4 (104.3–107.3)
- delete/fast: 3.2 (3.1–3.2)
- delete/undefined: 3.2 (3.1–3.2)
- elements/DOUBLE: 18.4 (18.4–18.5)
- elements/ELEMENTS: 13.2 (13.1–13.8)
- elements/HOLEY: 13.4 (13.2–14.9)
- elements/SMI: 13.5 (13.2–13.8)
- ic/1-shapes: 21.7 (21.4–21.9)
- ic/2-shapes: 23.3 (23–23.5)
- ic/4-shapes: 31.7 (28.6–35.2)
- ic/8-shapes: 91.3 (91–91.9)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–59)
- trycatch/naive-plain: 58 (58–58)
- trycatch/naive-try: 165 (164–165)

- IC 8 форм / 1: **×4.21** · 4 формы / 1: ×1.46
- delete / fast: **×32.6** · undefined / fast: ×1.00
- try/catch наивный: ×2.84 · изолированный: 58 = 58
- HOLEY / SMI: ×0.99 · DOUBLE / SMI: ×1.36
