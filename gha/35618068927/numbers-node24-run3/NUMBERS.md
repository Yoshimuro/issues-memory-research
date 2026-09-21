# Числа прогона gha-node24-run3

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:19:03Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.3** (0.29–0.3) · B: **1.33** (1.33–1.35) · **×4.4** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.35** (1.34–1.39)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.36** (1.34–1.37)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.28–0.3)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.3** (0.29–0.33)
- без правил / с правилами: **×4.6**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1044.7** → Sparkplug **782** → Maglev **147.7** → TurboFan **89.8** · Ignition/TurboFan **×11.6**
- на каком вызове ярус (5 прогонов): Sparkplug 608–629 · Maglev 835–932 · TurboFan 13190–13406

## A/B под --turbolev
- A **0.29** · B **1.4** · **×4.8**

## wrong map (5 прогонов demo-wrongmap + прибор)
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
| 500 | 1 | ×1.21 | ×0.95 | ×4.65 | ×1.23 | 67% → 55% |
| 500 | 5 | ×1.74 | ×0.97 | ×4.72 | ×1.21 | 56% → 33% |
| 500 | 20 | ×2.80 | ×1.00 | ×4.73 | ×1.22 | 36% → 13% |
| 5000 | 1 | ×1.24 | ×0.95 | ×4.68 | ×1.36 | 69% → 56% |
| 5000 | 5 | ×1.81 | ×0.96 | ×4.70 | ×1.36 | 58% → 33% |
| 5000 | 20 | ×2.86 | ×0.99 | ×4.71 | ×1.37 | 36% → 13% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.26 | ×1.63 | ×4.43 | ×1.24 | 68% → 54% |
| 500 | 5 | ×1.76 | ×1.63 | ×4.63 | ×1.24 | 57% → 32% |
| 500 | 20 | ×2.81 | ×1.67 | ×4.53 | ×1.25 | 36% → 13% |
| 5000 | 1 | ×1.26 | ×1.65 | ×4.65 | ×1.36 | 71% → 55% |
| 5000 | 5 | ×1.84 | ×1.66 | ×4.66 | ×1.37 | 59% → 32% |
| 5000 | 20 | ×2.88 | ×1.53 | ×4.65 | ×1.38 | 36% → 13% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.04 | ×1.11 | ×1.40 | ×1.02 | 67% → 65% |
| 500 | 5 | ×1.07 | ×1.11 | ×1.36 | ×1.01 | 56% → 52% |
| 500 | 20 | ×1.21 | ×1.08 | ×1.40 | ×1.02 | 36% → 30% |
| 5000 | 1 | ×1.03 | ×1.05 | ×1.39 | ×1.01 | 69% → 67% |
| 5000 | 5 | ×1.09 | ×1.08 | ×1.36 | ×1.01 | 58% → 54% |
| 5000 | 20 | ×1.18 | ×1.09 | ×1.37 | ×1.02 | 36% → 30% |

- абсолют batch=500 R=1, мс: mono-llm 0.433 · guard-llm 0.525

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **869 rps** · p50 56 мс · p99 109 мс · errors 0
- guard-llm: **511 rps** · p50 95 мс · p99 188 мс · errors 0
- mixed-mono: **805 rps** · p50 60 мс · p99 117 мс · errors 0
- mono/guard **×1.70** · p99 +72% · mixed к mono -7%

## Мифы (медианы 5 повторов), мс
- delete/delete: 111 (110.9–118.5)
- delete/fast: 2.9 (2.9–2.9)
- delete/undefined: 2.9 (2.9–2.9)
- elements/DOUBLE: 19.9 (19.9–20)
- elements/ELEMENTS: 11.8 (11.7–11.8)
- elements/HOLEY: 11.7 (11.7–11.7)
- elements/SMI: 10.7 (10.6–10.7)
- ic/1-shapes: 27 (26.9–27.1)
- ic/2-shapes: 30.4 (30.3–30.7)
- ic/4-shapes: 39.1 (37.6–45.8)
- ic/8-shapes: 104.9 (104.6–108.5)
- trycatch/honest-plain: 50 (50–50)
- trycatch/honest-try: 50 (50–51)
- trycatch/naive-plain: 62 (62–63)
- trycatch/naive-try: 171 (171–172)

- IC 8 форм / 1: **×3.89** · 4 формы / 1: ×1.45
- delete / fast: **×38.3** · undefined / fast: ×1.00
- try/catch наивный: ×2.76 · изолированный: 50 = 50
- HOLEY / SMI: ×1.09 · DOUBLE / SMI: ×1.86
