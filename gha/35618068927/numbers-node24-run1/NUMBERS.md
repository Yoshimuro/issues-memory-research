# Числа прогона gha-node24-run1

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:19:04Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.26** (0.26–0.28) · B: **1.38** (1.37–1.38) · **×5.3** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.38** (1.38–1.42)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.37–1.42)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.26** (0.25–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.25–0.31)
- без правил / с правилами: **×5.1**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1101** → Sparkplug **824.4** → Maglev **143.5** → TurboFan **83.5** · Ignition/TurboFan **×13.2**
- на каком вызове ярус (5 прогонов): Sparkplug 605–686 · Maglev 825–998 · TurboFan 12745–13441

## A/B под --turbolev
- A **0.27** · B **1.59** · **×5.9**

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
| 500 | 1 | ×1.21 | ×0.91 | ×5.22 | ×1.24 | 68% → 56% |
| 500 | 5 | ×1.77 | ×0.94 | ×5.29 | ×1.26 | 59% → 33% |
| 500 | 20 | ×2.97 | ×0.94 | ×5.30 | ×1.24 | 39% → 13% |
| 5000 | 1 | ×1.24 | ×0.92 | ×4.93 | ×1.39 | 70% → 57% |
| 5000 | 5 | ×1.79 | ×0.91 | ×4.86 | ×1.39 | 60% → 33% |
| 5000 | 20 | ×3.04 | ×0.96 | ×5.22 | ×1.39 | 38% → 13% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.26 | ×1.68 | ×5.22 | ×1.23 | 70% → 55% |
| 500 | 5 | ×1.77 | ×1.72 | ×5.34 | ×1.25 | 60% → 34% |
| 500 | 20 | ×3.06 | ×1.76 | ×5.34 | ×1.24 | 40% → 13% |
| 5000 | 1 | ×1.30 | ×1.69 | ×5.00 | ×1.39 | 72% → 56% |
| 5000 | 5 | ×1.88 | ×1.67 | ×5.01 | ×1.39 | 61% → 33% |
| 5000 | 20 | ×3.05 | ×1.57 | ×5.13 | ×1.40 | 38% → 13% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.04 | ×1.11 | ×1.33 | ×1.04 | 68% → 66% |
| 500 | 5 | ×1.09 | ×1.11 | ×1.38 | ×1.04 | 59% → 55% |
| 500 | 20 | ×1.18 | ×1.14 | ×1.39 | ×1.05 | 39% → 33% |
| 5000 | 1 | ×1.03 | ×1.08 | ×1.30 | ×1.03 | 70% → 68% |
| 5000 | 5 | ×1.06 | ×1.08 | ×1.27 | ×1.03 | 60% → 56% |
| 5000 | 20 | ×1.16 | ×1.08 | ×1.32 | ×1.03 | 38% → 33% |

- абсолют batch=500 R=1, мс: mono-llm 0.442 · guard-llm 0.534

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **851 rps** · p50 56 мс · p99 112 мс · errors 0
- guard-llm: **502 rps** · p50 97 мс · p99 192 мс · errors 0
- mixed-mono: **808 rps** · p50 59 мс · p99 118 мс · errors 0
- mono/guard **×1.69** · p99 +71% · mixed к mono -5%

## Мифы (медианы 5 повторов), мс
- delete/delete: 109.1 (106–109.1)
- delete/fast: 2.6 (2.5–2.6)
- delete/undefined: 2.5 (2.5–2.6)
- elements/DOUBLE: 17.8 (17.8–18)
- elements/ELEMENTS: 10.4 (10.3–11.2)
- elements/HOLEY: 10.4 (10.3–10.4)
- elements/SMI: 8 (7.9–8.3)
- ic/1-shapes: 25.6 (25.4–25.8)
- ic/2-shapes: 30.4 (30.2–31.5)
- ic/4-shapes: 40.5 (39–40.9)
- ic/8-shapes: 93.9 (93.6–97)
- trycatch/honest-plain: 47 (47–47)
- trycatch/honest-try: 47 (47–47)
- trycatch/naive-plain: 56 (56–59)
- trycatch/naive-try: 159 (158–161)

- IC 8 форм / 1: **×3.67** · 4 формы / 1: ×1.58
- delete / fast: **×42.0** · undefined / fast: ×0.96
- try/catch наивный: ×2.84 · изолированный: 47 = 47
- HOLEY / SMI: ×1.30 · DOUBLE / SMI: ×2.23
