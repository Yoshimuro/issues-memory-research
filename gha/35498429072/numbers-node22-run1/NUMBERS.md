# Числа прогона gha-node22-run1

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-20T08:01:56Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.28** (0.27–0.29) · B: **1.4** (1.39–1.4) · **×5.0** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.38–1.42)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.43** (1.39–1.53)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.26–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.27–0.33)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1165.4** → Sparkplug **795.7** → Maglev **793.8** → TurboFan **94.7** · Ignition/TurboFan **×12.3**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 5165–5393

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
| 500 | 1 | ×1.18 | ×0.94 | ×4.84 | ×1.23 | 73% → 62% |
| 500 | 5 | ×1.65 | ×0.94 | ×4.99 | ×1.24 | 63% → 39% |
| 500 | 20 | ×2.72 | ×0.97 | ×4.99 | ×1.27 | 43% → 16% |
| 5000 | 1 | ×1.19 | ×0.91 | ×4.65 | ×1.36 | 74% → 62% |
| 5000 | 5 | ×1.65 | ×0.91 | ×4.54 | ×1.38 | 63% → 38% |
| 5000 | 20 | ×2.52 | ×0.94 | ×4.03 | ×1.33 | 38% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.23 | ×1.58 | ×4.95 | ×1.23 | 74% → 61% |
| 500 | 5 | ×1.76 | ×1.62 | ×5.21 | ×1.26 | 64% → 37% |
| 500 | 20 | ×2.79 | ×1.65 | ×4.98 | ×1.29 | 43% → 16% |
| 5000 | 1 | ×1.25 | ×1.65 | ×4.95 | ×1.37 | 75% → 60% |
| 5000 | 5 | ×1.76 | ×1.59 | ×4.95 | ×1.36 | 64% → 37% |
| 5000 | 20 | ×2.60 | ×1.64 | ×4.10 | ×1.34 | 38% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.04 | ×1.11 | ×1.37 | ×1.02 | 73% → 71% |
| 500 | 5 | ×1.08 | ×1.11 | ×1.43 | ×1.02 | 63% → 59% |
| 500 | 20 | ×1.21 | ×1.11 | ×1.47 | ×1.04 | 43% → 36% |
| 5000 | 1 | ×1.04 | ×1.11 | ×1.34 | ×1.02 | 74% → 72% |
| 5000 | 5 | ×1.07 | ×1.11 | ×1.30 | ×1.04 | 63% → 59% |
| 5000 | 20 | ×1.16 | ×1.13 | ×1.30 | ×1.02 | 38% → 33% |

- абсолют batch=500 R=1, мс: mono-llm 0.512 · guard-llm 0.606

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **731 rps** · p50 66 мс · p99 132 мс · errors 0
- guard-llm: **452 rps** · p50 107 мс · p99 214 мс · errors 0
- mixed-mono: **684 rps** · p50 70 мс · p99 141 мс · errors 0
- mono/guard **×1.62** · p99 +62% · mixed к mono -6%

## Мифы (медианы 5 повторов), мс
- delete/delete: 104.3 (102.8–110.7)
- delete/fast: 3.1 (3.1–3.2)
- delete/undefined: 3.2 (3.1–3.2)
- elements/DOUBLE: 18.6 (18.4–18.7)
- elements/ELEMENTS: 13.6 (13.3–14.2)
- elements/HOLEY: 13.7 (13.5–13.7)
- elements/SMI: 13.6 (13–14.1)
- ic/1-shapes: 21.9 (21.8–22.1)
- ic/2-shapes: 23.5 (23.1–23.9)
- ic/4-shapes: 32.1 (28–35.1)
- ic/8-shapes: 91.9 (91.2–93.5)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (58–58)
- trycatch/naive-try: 165 (164–166)

- IC 8 форм / 1: **×4.20** · 4 формы / 1: ×1.47
- delete / fast: **×33.6** · undefined / fast: ×1.03
- try/catch наивный: ×2.84 · изолированный: 58 = 58
- HOLEY / SMI: ×1.01 · DOUBLE / SMI: ×1.37
