# Числа прогона gha-node24-run1

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:11:23Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.3** (0.29–0.3) · B: **1.34** (1.33–1.42) · **×4.5** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.34** (1.34–1.41)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.36** (1.34–1.37)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.29–0.3)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.3** (0.29–0.32)
- без правил / с правилами: **×4.5**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1051.3** → Sparkplug **784.7** → Maglev **147.8** → TurboFan **89.3** · Ignition/TurboFan **×11.8**
- на каком вызове ярус (5 прогонов): Sparkplug 606–644 · Maglev 900–930 · TurboFan 13084–13449

## A/B под --turbolev
- A **0.29** · B **1.4** · **×4.8**

## wrong map (5 прогонов demo-wrongmap + прибор)
- analyzer-ref-a (sfi: 1
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
| 500 | 1 | ×1.21 | ×0.97 | ×4.43 | ×1.24 | 66% → 55% |
| 500 | 5 | ×1.72 | ×0.95 | ×4.54 | ×1.22 | 55% → 32% |
| 500 | 20 | ×2.74 | ×0.97 | ×4.51 | ×1.22 | 35% → 13% |
| 5000 | 1 | ×1.24 | ×0.96 | ×4.58 | ×1.36 | 69% → 56% |
| 5000 | 5 | ×1.79 | ×0.96 | ×4.69 | ×1.36 | 58% → 32% |
| 5000 | 20 | ×2.88 | ×0.98 | ×4.73 | ×1.39 | 36% → 13% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.25 | ×1.65 | ×4.65 | ×1.22 | 68% → 54% |
| 500 | 5 | ×1.77 | ×1.61 | ×4.62 | ×1.22 | 57% → 33% |
| 500 | 20 | ×2.84 | ×1.63 | ×4.68 | ×1.24 | 36% → 13% |
| 5000 | 1 | ×1.29 | ×1.64 | ×4.63 | ×1.36 | 71% → 55% |
| 5000 | 5 | ×1.84 | ×1.65 | ×4.63 | ×1.36 | 59% → 32% |
| 5000 | 20 | ×2.86 | ×1.52 | ×4.61 | ×1.38 | 36% → 13% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.08 | ×1.33 | ×1.01 | 66% → 64% |
| 500 | 5 | ×1.08 | ×1.08 | ×1.34 | ×1.02 | 55% → 52% |
| 500 | 20 | ×1.19 | ×1.08 | ×1.36 | ×1.01 | 35% → 30% |
| 5000 | 1 | ×1.02 | ×1.06 | ×1.37 | ×1.01 | 69% → 67% |
| 5000 | 5 | ×1.08 | ×1.08 | ×1.36 | ×1.01 | 58% → 54% |
| 5000 | 20 | ×1.19 | ×1.07 | ×1.35 | ×1.01 | 36% → 31% |

- абсолют batch=500 R=1, мс: mono-llm 0.438 · guard-llm 0.531

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **875 rps** · p50 55 мс · p99 107 мс · errors 0
- guard-llm: **516 rps** · p50 94 мс · p99 186 мс · errors 0
- mixed-mono: **814 rps** · p50 59 мс · p99 116 мс · errors 0
- mono/guard **×1.70** · p99 +74% · mixed к mono -7%

## Мифы (медианы 5 повторов), мс
- delete/delete: 112.6 (110.8–118.1)
- delete/fast: 2.9 (2.9–2.9)
- delete/undefined: 2.9 (2.9–3)
- elements/DOUBLE: 19.9 (19.9–19.9)
- elements/ELEMENTS: 11.7 (11.7–11.8)
- elements/HOLEY: 11.7 (11.7–12.2)
- elements/SMI: 10.7 (10.6–10.9)
- ic/1-shapes: 27 (26.8–27.6)
- ic/2-shapes: 30.7 (30.5–30.9)
- ic/4-shapes: 42.5 (39–47.7)
- ic/8-shapes: 105 (103.9–115.3)
- trycatch/honest-plain: 50 (50–51)
- trycatch/honest-try: 50 (50–50)
- trycatch/naive-plain: 62 (62–63)
- trycatch/naive-try: 171 (170–171)

- IC 8 форм / 1: **×3.89** · 4 формы / 1: ×1.57
- delete / fast: **×38.8** · undefined / fast: ×1.00
- try/catch наивный: ×2.76 · изолированный: 50 = 50
- HOLEY / SMI: ×1.09 · DOUBLE / SMI: ×1.86
