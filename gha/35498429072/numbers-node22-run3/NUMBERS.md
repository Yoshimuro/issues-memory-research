# Числа прогона gha-node22-run3

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-20T08:02:00Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.27** (0.26–0.28) · B: **1.4** (1.39–1.42) · **×5.2** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.39** (1.38–1.44)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.43** (1.39–1.52)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.26–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.27–0.32)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1163.3** → Sparkplug **801.6** → Maglev **798.9** → TurboFan **93.8** · Ignition/TurboFan **×12.4**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 5051–5356

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
| 500 | 1 | ×1.19 | ×0.94 | ×4.79 | ×1.23 | 73% → 62% |
| 500 | 5 | ×1.65 | ×0.94 | ×4.97 | ×1.26 | 63% → 39% |
| 500 | 20 | ×2.74 | ×0.94 | ×5.04 | ×1.27 | 43% → 16% |
| 5000 | 1 | ×1.19 | ×0.90 | ×4.73 | ×1.35 | 73% → 62% |
| 5000 | 5 | ×1.65 | ×0.90 | ×4.66 | ×1.34 | 63% → 38% |
| 5000 | 20 | ×2.58 | ×0.93 | ×4.21 | ×1.32 | 39% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.22 | ×1.64 | ×5.22 | ×1.23 | 75% → 61% |
| 500 | 5 | ×1.78 | ×1.68 | ×5.44 | ×1.23 | 64% → 37% |
| 500 | 20 | ×2.83 | ×1.68 | ×5.18 | ×1.23 | 44% → 16% |
| 5000 | 1 | ×1.26 | ×1.67 | ×5.25 | ×1.37 | 75% → 59% |
| 5000 | 5 | ×1.77 | ×1.64 | ×5.25 | ×1.35 | 65% → 37% |
| 5000 | 20 | ×2.63 | ×1.65 | ×4.21 | ×1.34 | 39% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.04 | ×1.09 | ×1.37 | ×1.02 | 73% → 71% |
| 500 | 5 | ×1.08 | ×1.11 | ×1.41 | ×1.04 | 63% → 59% |
| 500 | 20 | ×1.21 | ×1.11 | ×1.47 | ×1.04 | 43% → 36% |
| 5000 | 1 | ×1.03 | ×1.10 | ×1.32 | ×1.01 | 73% → 72% |
| 5000 | 5 | ×1.06 | ×1.11 | ×1.32 | ×1.02 | 63% → 59% |
| 5000 | 20 | ×1.16 | ×1.10 | ×1.31 | ×1.03 | 39% → 34% |

- абсолют batch=500 R=1, мс: mono-llm 0.51 · guard-llm 0.605

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **748 rps** · p50 64 мс · p99 129 мс · errors 0
- guard-llm: **462 rps** · p50 104 мс · p99 210 мс · errors 0
- mixed-mono: **695 rps** · p50 68 мс · p99 137 мс · errors 0
- mono/guard **×1.62** · p99 +63% · mixed к mono -7%

## Мифы (медианы 5 повторов), мс
- delete/delete: 107.4 (104.4–107.5)
- delete/fast: 3.2 (3.1–3.2)
- delete/undefined: 3.2 (3.1–3.2)
- elements/DOUBLE: 18.6 (18.6–18.7)
- elements/ELEMENTS: 13.6 (13.3–14.5)
- elements/HOLEY: 13.7 (13.2–14.5)
- elements/SMI: 13.4 (13–13.6)
- ic/1-shapes: 21.7 (21.4–21.9)
- ic/2-shapes: 23.1 (22.9–23.3)
- ic/4-shapes: 31.8 (28–34.8)
- ic/8-shapes: 92.8 (91–94.9)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (58–59)
- trycatch/naive-try: 165 (164–165)

- IC 8 форм / 1: **×4.28** · 4 формы / 1: ×1.47
- delete / fast: **×33.6** · undefined / fast: ×1.00
- try/catch наивный: ×2.84 · изолированный: 58 = 58
- HOLEY / SMI: ×1.02 · DOUBLE / SMI: ×1.39
