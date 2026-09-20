# Числа прогона gha-node22-run2

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-20T08:01:58Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.27** (0.27–0.29) · B: **1.39** (1.38–1.4) · **×5.1** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.39–1.42)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.43** (1.39–1.58)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.26–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.26–0.33)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1146.3** → Sparkplug **790.9** → Maglev **791.3** → TurboFan **93.5** · Ignition/TurboFan **×12.3**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 5140–5402

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
| 500 | 1 | ×1.17 | ×0.94 | ×4.79 | ×1.23 | 73% → 62% |
| 500 | 5 | ×1.65 | ×0.97 | ×4.96 | ×1.24 | 64% → 39% |
| 500 | 20 | ×2.69 | ×0.97 | ×4.99 | ×1.27 | 44% → 16% |
| 5000 | 1 | ×1.20 | ×0.91 | ×4.70 | ×1.35 | 74% → 62% |
| 5000 | 5 | ×1.65 | ×0.92 | ×4.64 | ×1.34 | 63% → 38% |
| 5000 | 20 | ×2.53 | ×0.93 | ×4.11 | ×1.32 | 39% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.23 | ×1.64 | ×5.22 | ×1.23 | 75% → 61% |
| 500 | 5 | ×1.77 | ×1.68 | ×5.47 | ×1.24 | 65% → 37% |
| 500 | 20 | ×2.84 | ×1.62 | ×5.19 | ×1.27 | 44% → 16% |
| 5000 | 1 | ×1.26 | ×1.65 | ×5.23 | ×1.37 | 75% → 60% |
| 5000 | 5 | ×1.76 | ×1.63 | ×5.18 | ×1.35 | 65% → 37% |
| 5000 | 20 | ×2.64 | ×1.64 | ×4.21 | ×1.32 | 39% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.02 | ×1.11 | ×1.37 | ×1.02 | 73% → 71% |
| 500 | 5 | ×1.07 | ×1.11 | ×1.39 | ×1.02 | 64% → 60% |
| 500 | 20 | ×1.19 | ×1.11 | ×1.46 | ×1.02 | 44% → 36% |
| 5000 | 1 | ×1.03 | ×1.11 | ×1.31 | ×1.01 | 74% → 72% |
| 5000 | 5 | ×1.06 | ×1.11 | ×1.30 | ×1.02 | 63% → 60% |
| 5000 | 20 | ×1.14 | ×1.11 | ×1.30 | ×1.03 | 39% → 34% |

- абсолют batch=500 R=1, мс: mono-llm 0.515 · guard-llm 0.605

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **745 rps** · p50 64 мс · p99 129 мс · errors 0
- guard-llm: **467 rps** · p50 104 мс · p99 207 мс · errors 0
- mixed-mono: **696 rps** · p50 69 мс · p99 138 мс · errors 0
- mono/guard **×1.60** · p99 +60% · mixed к mono -7%

## Мифы (медианы 5 повторов), мс
- delete/delete: 104.5 (104.4–104.5)
- delete/fast: 3.2 (3.1–3.2)
- delete/undefined: 3.1 (3.1–3.2)
- elements/DOUBLE: 18.5 (18.4–18.7)
- elements/ELEMENTS: 13.9 (13.4–14.2)
- elements/HOLEY: 14 (13.4–14.4)
- elements/SMI: 13.6 (13.3–14)
- ic/1-shapes: 21.8 (21.2–22.4)
- ic/2-shapes: 23.6 (23.3–23.9)
- ic/4-shapes: 28.5 (28.2–35.9)
- ic/8-shapes: 91.7 (91.2–93.4)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (58–59)
- trycatch/naive-try: 165 (164–165)

- IC 8 форм / 1: **×4.21** · 4 формы / 1: ×1.31
- delete / fast: **×32.7** · undefined / fast: ×0.97
- try/catch наивный: ×2.84 · изолированный: 58 = 58
- HOLEY / SMI: ×1.03 · DOUBLE / SMI: ×1.36
