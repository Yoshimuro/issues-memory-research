# Числа прогона gha-node24-run1

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-20T08:02:09Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.31** (0.31–0.33) · B: **1.1** (1.08–1.14) · **×3.5** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.08** (1.05–1.14)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.08** (1.05–1.12)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.31** (0.31–0.31)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.31** (0.31–0.35)
- без правил / с правилами: **×3.5**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **798.1** → Sparkplug **630.4** → Maglev **164.1** → TurboFan **89.5** · Ignition/TurboFan **×8.9**
- на каком вызове ярус (5 прогонов): Sparkplug 629–818 · Maglev 1152–1273 · TurboFan 14039–15110

## A/B под --turbolev
- A **0.32** · B **1.14** · **×3.6**

## wrong map (5 прогонов demo-wrongmap + прибор)
- analyzer-ref-a (sfi: 1
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
| 500 | 1 | ×1.23 | ×1.00 | ×4.25 | ×1.22 | 65% → 53% |
| 500 | 5 | ×1.86 | ×1.04 | ×4.70 | ×1.22 | 53% → 30% |
| 500 | 20 | ×2.75 | ×1.00 | ×4.50 | ×1.21 | 34% → 12% |
| 5000 | 1 | ×1.18 | ×0.95 | ×3.10 | ×1.33 | 63% → 52% |
| 5000 | 5 | ×1.56 | ×0.95 | ×3.37 | ×1.32 | 46% → 29% |
| 5000 | 20 | ×2.35 | ×0.94 | ×3.37 | ×1.35 | 27% → 11% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.29 | ×1.60 | ×4.93 | ×1.22 | 66% → 53% |
| 500 | 5 | ×1.94 | ×1.64 | ×4.91 | ×1.22 | 55% → 30% |
| 500 | 20 | ×3.08 | ×1.52 | ×5.39 | ×1.20 | 37% → 12% |
| 5000 | 1 | ×1.22 | ×1.40 | ×3.06 | ×1.32 | 64% → 51% |
| 5000 | 5 | ×1.56 | ×1.37 | ×3.17 | ×1.33 | 47% → 29% |
| 5000 | 20 | ×2.44 | ×1.35 | ×3.44 | ×1.34 | 27% → 11% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.02 | ×1.04 | ×1.19 | ×1.02 | 65% → 63% |
| 500 | 5 | ×1.05 | ×1.04 | ×1.22 | ×1.02 | 53% → 51% |
| 500 | 20 | ×1.06 | ×1.04 | ×1.16 | ×1.02 | 34% → 31% |
| 5000 | 1 | ×0.98 | ×1.05 | ×1.20 | ×1.01 | 63% → 63% |
| 5000 | 5 | ×1.00 | ×1.04 | ×1.24 | ×1.00 | 46% → 45% |
| 5000 | 20 | ×1.08 | ×1.03 | ×1.15 | ×1.00 | 27% → 25% |

- абсолют batch=500 R=1, мс: mono-llm 0.297 · guard-llm 0.365

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **1234 rps** · p50 39 мс · p99 50 мс · errors 0
- guard-llm: **725 rps** · p50 67 мс · p99 82 мс · errors 0
- mixed-mono: **1172 rps** · p50 41 мс · p99 54 мс · errors 0
- mono/guard **×1.70** · p99 +64% · mixed к mono -5%

## Мифы (медианы 5 повторов), мс
- delete/delete: 67.7 (64.9–68)
- delete/fast: 2.1 (2.1–2.1)
- delete/undefined: 2.1 (2.1–2.1)
- elements/DOUBLE: 9.4 (9.4–9.4)
- elements/ELEMENTS: 10.7 (10.7–10.9)
- elements/HOLEY: 10.7 (10.7–10.8)
- elements/SMI: 8.8 (8.6–8.9)
- ic/1-shapes: 19.9 (19.8–20.3)
- ic/2-shapes: 21.1 (21–21.2)
- ic/4-shapes: 29.3 (28.6–29.8)
- ic/8-shapes: 56.9 (56.5–57.5)
- trycatch/honest-plain: 29 (28–29)
- trycatch/honest-try: 29 (28–29)
- trycatch/naive-plain: 42 (41–42)
- trycatch/naive-try: 131 (131–132)

- IC 8 форм / 1: **×2.86** · 4 формы / 1: ×1.47
- delete / fast: **×32.2** · undefined / fast: ×1.00
- try/catch наивный: ×3.12 · изолированный: 29 = 29
- HOLEY / SMI: ×1.22 · DOUBLE / SMI: ×1.07
