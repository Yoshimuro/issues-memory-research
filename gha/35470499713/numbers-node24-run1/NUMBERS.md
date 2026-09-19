# Числа прогона gha-node24-run1

```
node v24.21.0 v8 13.6.233.17-node.53 linux/x64
alpine 3.24.2
cpus=4
2026-09-19T21:28:26Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.28** (0.27–0.29) · B: **1.4** (1.38–1.52) · **×5.0** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.39** (1.38–1.4)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.39–1.43)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.27** (0.25–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.26–0.32)
- без правил / с правилами: **×5.1**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1102** → Sparkplug **825.7** → Maglev **143.2** → TurboFan **84.1** · Ignition/TurboFan **×13.1**
- на каком вызове ярус (5 прогонов): Sparkplug 626–675 · Maglev 840–984 · TurboFan 12698–13322

## A/B под --turbolev
- A **0.27** · B **1.6** · **×5.9**

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
| 500 | 1 | ×1.20 | ×0.91 | ×5.28 | ×1.24 | 68% → 56% |
| 500 | 5 | ×1.73 | ×0.94 | ×5.03 | ×1.25 | 59% → 34% |
| 500 | 20 | ×2.91 | ×0.94 | ×5.08 | ×1.27 | 38% → 13% |
| 5000 | 1 | ×1.22 | ×0.92 | ×4.82 | ×1.38 | 71% → 57% |
| 5000 | 5 | ×1.82 | ×0.92 | ×5.07 | ×1.38 | 60% → 33% |
| 5000 | 20 | ×2.99 | ×0.97 | ×5.18 | ×1.41 | 38% → 13% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.27 | ×1.76 | ×5.11 | ×1.24 | 70% → 56% |
| 500 | 5 | ×1.83 | ×1.76 | ×5.33 | ×1.23 | 61% → 33% |
| 500 | 20 | ×2.98 | ×1.76 | ×5.17 | ×1.27 | 40% → 13% |
| 5000 | 1 | ×1.29 | ×1.66 | ×4.97 | ×1.39 | 72% → 56% |
| 5000 | 5 | ×1.89 | ×1.72 | ×5.13 | ×1.38 | 61% → 33% |
| 5000 | 20 | ×3.06 | ×1.58 | ×5.17 | ×1.39 | 38% → 13% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.02 | ×1.11 | ×1.39 | ×1.04 | 68% → 66% |
| 500 | 5 | ×1.07 | ×1.17 | ×1.38 | ×1.04 | 59% → 55% |
| 500 | 20 | ×1.20 | ×1.11 | ×1.40 | ×1.04 | 38% → 33% |
| 5000 | 1 | ×1.02 | ×1.10 | ×1.28 | ×1.03 | 71% → 69% |
| 5000 | 5 | ×1.08 | ×1.10 | ×1.32 | ×1.03 | 60% → 56% |
| 5000 | 20 | ×1.15 | ×1.08 | ×1.31 | ×1.03 | 38% → 33% |

- абсолют batch=500 R=1, мс: mono-llm 0.445 · guard-llm 0.536

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **859 rps** · p50 56 мс · p99 111 мс · errors 0
- guard-llm: **504 rps** · p50 96 мс · p99 192 мс · errors 0
- mixed-mono: **814 rps** · p50 59 мс · p99 117 мс · errors 0
- mono/guard **×1.70** · p99 +73% · mixed к mono -5%

## Мифы (медианы 5 повторов), мс
- delete/delete: 109.2 (105.9–112)
- delete/fast: 2.6 (2.6–2.6)
- delete/undefined: 2.6 (2.5–2.6)
- elements/DOUBLE: 17.8 (17.8–17.8)
- elements/ELEMENTS: 10.4 (10.3–10.4)
- elements/HOLEY: 10.4 (10.3–10.6)
- elements/SMI: 8 (8–8.2)
- ic/1-shapes: 25.4 (25.4–26)
- ic/2-shapes: 30.3 (29.9–31.2)
- ic/4-shapes: 40 (39–40.6)
- ic/8-shapes: 94.2 (93.7–94.7)
- trycatch/honest-plain: 47 (47–47)
- trycatch/honest-try: 47 (47–49)
- trycatch/naive-plain: 57 (57–58)
- trycatch/naive-try: 160 (159–162)

- IC 8 форм / 1: **×3.71** · 4 формы / 1: ×1.57
- delete / fast: **×42.0** · undefined / fast: ×1.00
- try/catch наивный: ×2.81 · изолированный: 47 = 47
- HOLEY / SMI: ×1.30 · DOUBLE / SMI: ×2.23
