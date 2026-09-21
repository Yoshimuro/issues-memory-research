# Числа прогона gha-node24-run3

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:11:29Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.29** (0.29–0.3) · B: **1.33** (1.32–1.35) · **×4.6** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.35** (1.34–1.45)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.35** (1.32–1.44)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.28–0.32)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.28–0.31)
- без правил / с правилами: **×4.7**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **937** → Sparkplug **786.6** → Maglev **148.5** → TurboFan **93.4** · Ignition/TurboFan **×10.0**
- на каком вызове ярус (5 прогонов): Sparkplug 623–669 · Maglev 1058–1159 · TurboFan 13557–14010

## A/B под --turbolev
- A **0.3** · B **1.36** · **×4.5**

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
| 500 | 1 | ×1.23 | ×0.94 | ×4.65 | ×1.26 | 66% → 54% |
| 500 | 5 | ×1.77 | ×0.97 | ×4.82 | ×1.28 | 55% → 31% |
| 500 | 20 | ×3.04 | ×1.00 | ×5.26 | ×1.29 | 36% → 12% |
| 5000 | 1 | ×1.25 | ×0.99 | ×4.35 | ×1.38 | 68% → 54% |
| 5000 | 5 | ×1.78 | ×0.98 | ×4.18 | ×1.38 | 55% → 31% |
| 5000 | 20 | ×2.78 | ×1.01 | ×4.24 | ×1.45 | 33% → 12% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.28 | ×1.48 | ×4.82 | ×1.28 | 67% → 53% |
| 500 | 5 | ×1.82 | ×1.42 | ×5.00 | ×1.28 | 55% → 30% |
| 500 | 20 | ×3.05 | ×1.52 | ×5.15 | ×1.29 | 36% → 12% |
| 5000 | 1 | ×1.29 | ×1.45 | ×4.39 | ×1.38 | 69% → 54% |
| 5000 | 5 | ×1.84 | ×1.47 | ×4.25 | ×1.39 | 56% → 30% |
| 5000 | 20 | ×2.81 | ×1.41 | ×4.27 | ×1.40 | 33% → 12% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.04 | ×1.09 | ×1.47 | ×1.03 | 66% → 64% |
| 500 | 5 | ×1.11 | ×1.09 | ×1.52 | ×1.04 | 55% → 49% |
| 500 | 20 | ×1.34 | ×1.13 | ×1.69 | ×1.06 | 36% → 28% |
| 5000 | 1 | ×1.06 | ×1.06 | ×1.61 | ×1.05 | 68% → 65% |
| 5000 | 5 | ×1.12 | ×1.09 | ×1.49 | ×1.05 | 55% → 49% |
| 5000 | 20 | ×1.26 | ×1.09 | ×1.48 | ×1.04 | 33% → 26% |

- абсолют batch=500 R=1, мс: mono-llm 0.351 · guard-llm 0.43

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **1062 rps** · p50 46 мс · p99 56 мс · errors 0
- guard-llm: **628 rps** · p50 78 мс · p99 92 мс · errors 0
- mixed-mono: **983 rps** · p50 49 мс · p99 63 мс · errors 0
- mono/guard **×1.69** · p99 +64% · mixed к mono -7%

## Мифы (медианы 5 повторов), мс
- delete/delete: 85.7 (85.6–94.5)
- delete/fast: 2.5 (1.9–2.7)
- delete/undefined: 2.5 (2.5–2.5)
- elements/DOUBLE: 11 (10.9–11.1)
- elements/ELEMENTS: 12.6 (12.5–12.6)
- elements/HOLEY: 12.5 (12.5–12.7)
- elements/SMI: 10.1 (10–10.3)
- ic/1-shapes: 23.2 (23.1–23.2)
- ic/2-shapes: 26.4 (26.2–26.6)
- ic/4-shapes: 38.9 (38.5–39.4)
- ic/8-shapes: 67.9 (67.2–68.1)
- trycatch/honest-plain: 33 (33–33)
- trycatch/honest-try: 33 (33–43)
- trycatch/naive-plain: 50 (49–51)
- trycatch/naive-try: 121 (121–122)

- IC 8 форм / 1: **×2.93** · 4 формы / 1: ×1.68
- delete / fast: **×34.3** · undefined / fast: ×1.00
- try/catch наивный: ×2.42 · изолированный: 33 = 33
- HOLEY / SMI: ×1.24 · DOUBLE / SMI: ×1.09
