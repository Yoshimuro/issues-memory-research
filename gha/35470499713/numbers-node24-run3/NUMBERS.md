# Числа прогона gha-node24-run3

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-19T21:28:35Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.31** (0.31–0.31) · B: **1.09** (1.07–1.09) · **×3.5** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.09** (1.06–1.15)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.1** (1.06–1.14)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.31** (0.31–0.33)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.31** (0.31–0.35)
- без правил / с правилами: **×3.5**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **797.3** → Sparkplug **623.2** → Maglev **139.7** → TurboFan **85.5** · Ignition/TurboFan **×9.3**
- на каком вызове ярус (5 прогонов): Sparkplug 643–894 · Maglev 1159–1260 · TurboFan 14017–14906

## A/B под --turbolev
- A **0.32** · B **1.1** · **×3.4**

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
| 500 | 1 | ×1.27 | ×1.04 | ×4.53 | ×1.24 | 65% → 53% |
| 500 | 5 | ×1.91 | ×1.08 | ×5.08 | ×1.24 | 54% → 30% |
| 500 | 20 | ×3.14 | ×1.04 | ×5.69 | ×1.23 | 37% → 12% |
| 5000 | 1 | ×1.23 | ×0.97 | ×3.06 | ×1.35 | 62% → 50% |
| 5000 | 5 | ×1.65 | ×0.99 | ×3.36 | ×1.34 | 47% → 29% |
| 5000 | 20 | ×2.43 | ×0.97 | ×3.52 | ×1.40 | 27% → 11% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.29 | ×1.60 | ×5.31 | ×1.22 | 67% → 53% |
| 500 | 5 | ×1.91 | ×1.57 | ×5.03 | ×1.20 | 56% → 30% |
| 500 | 20 | ×3.27 | ×1.60 | ×5.83 | ×1.25 | 38% → 12% |
| 5000 | 1 | ×1.23 | ×1.52 | ×3.14 | ×1.37 | 63% → 52% |
| 5000 | 5 | ×1.72 | ×1.41 | ×3.29 | ×1.35 | 51% → 30% |
| 5000 | 20 | ×2.47 | ×1.33 | ×3.57 | ×1.36 | 28% → 11% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.15 | ×1.20 | ×1.33 | ×1.14 | 65% → 63% |
| 500 | 5 | ×1.08 | ×1.08 | ×1.37 | ×1.02 | 54% → 50% |
| 500 | 20 | ×1.22 | ×1.08 | ×1.49 | ×1.03 | 37% → 30% |
| 5000 | 1 | ×1.02 | ×1.08 | ×1.25 | ×1.00 | 62% → 60% |
| 5000 | 5 | ×1.04 | ×1.11 | ×1.29 | ×1.00 | 47% → 45% |
| 5000 | 20 | ×1.09 | ×1.01 | ×1.19 | ×0.99 | 27% → 24% |

- абсолют batch=500 R=1, мс: mono-llm 0.289 · guard-llm 0.367

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **1220 rps** · p50 39 мс · p99 64 мс · errors 0
- guard-llm: **725 rps** · p50 67 мс · p99 92 мс · errors 0
- mixed-mono: **1158 rps** · p50 42 мс · p99 53 мс · errors 0
- mono/guard **×1.68** · p99 +44% · mixed к mono -5%

## Мифы (медианы 5 повторов), мс
- delete/delete: 64.8 (64.2–69.9)
- delete/fast: 2 (2–2.1)
- delete/undefined: 2 (2–2)
- elements/DOUBLE: 9.3 (9.3–9.3)
- elements/ELEMENTS: 10.7 (10.5–11.7)
- elements/HOLEY: 10.7 (10.5–10.7)
- elements/SMI: 8.6 (8.4–8.8)
- ic/1-shapes: 19.8 (19.8–19.8)
- ic/2-shapes: 21 (21–21)
- ic/4-shapes: 28.8 (28.7–29.7)
- ic/8-shapes: 56.4 (55.5–57.1)
- trycatch/honest-plain: 28 (28–28)
- trycatch/honest-try: 28 (27–28)
- trycatch/naive-plain: 40 (40–41)
- trycatch/naive-try: 128 (128–129)

- IC 8 форм / 1: **×2.85** · 4 формы / 1: ×1.45
- delete / fast: **×32.4** · undefined / fast: ×1.00
- try/catch наивный: ×3.20 · изолированный: 28 = 28
- HOLEY / SMI: ×1.24 · DOUBLE / SMI: ×1.08
