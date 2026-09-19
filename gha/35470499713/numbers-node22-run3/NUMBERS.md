# Числа прогона gha-node22-run3

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-19T21:28:26Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.28** (0.27–0.28) · B: **1.39** (1.39–1.4) · **×5.0** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.38–1.48)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.42** (1.39–1.5)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.25–0.28)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.26–0.32)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1149.8** → Sparkplug **791.6** → Maglev **791.8** → TurboFan **93.5** · Ignition/TurboFan **×12.3**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 4930–5300

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
| 500 | 1 | ×1.17 | ×0.91 | ×5.06 | ×1.23 | 73% → 62% |
| 500 | 5 | ×1.65 | ×0.94 | ×4.97 | ×1.23 | 64% → 39% |
| 500 | 20 | ×2.72 | ×0.94 | ×4.99 | ×1.27 | 43% → 16% |
| 5000 | 1 | ×1.19 | ×0.90 | ×4.73 | ×1.35 | 74% → 62% |
| 5000 | 5 | ×1.65 | ×0.92 | ×4.64 | ×1.34 | 63% → 38% |
| 5000 | 20 | ×2.57 | ×0.93 | ×4.15 | ×1.30 | 39% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.24 | ×1.64 | ×5.28 | ×1.23 | 74% → 61% |
| 500 | 5 | ×1.77 | ×1.68 | ×5.41 | ×1.24 | 65% → 37% |
| 500 | 20 | ×2.81 | ×1.62 | ×5.13 | ×1.27 | 44% → 16% |
| 5000 | 1 | ×1.28 | ×1.66 | ×5.26 | ×1.37 | 75% → 60% |
| 5000 | 5 | ×1.76 | ×1.61 | ×5.17 | ×1.34 | 64% → 37% |
| 5000 | 20 | ×2.61 | ×1.65 | ×4.15 | ×1.33 | 39% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.11 | ×1.44 | ×1.02 | 73% → 71% |
| 500 | 5 | ×1.07 | ×1.11 | ×1.41 | ×1.01 | 64% → 59% |
| 500 | 20 | ×1.19 | ×1.11 | ×1.44 | ×1.02 | 43% → 36% |
| 5000 | 1 | ×1.02 | ×1.08 | ×1.32 | ×1.02 | 74% → 72% |
| 5000 | 5 | ×1.06 | ×1.11 | ×1.32 | ×1.02 | 63% → 59% |
| 5000 | 20 | ×1.16 | ×1.12 | ×1.33 | ×1.01 | 39% → 33% |

- абсолют batch=500 R=1, мс: mono-llm 0.512 · guard-llm 0.601

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **753 rps** · p50 63 мс · p99 127 мс · errors 0
- guard-llm: **472 rps** · p50 102 мс · p99 204 мс · errors 0
- mixed-mono: **704 rps** · p50 68 мс · p99 137 мс · errors 0
- mono/guard **×1.60** · p99 +61% · mixed к mono -7%

## Мифы (медианы 5 повторов), мс
- delete/delete: 104.3 (104.3–120.6)
- delete/fast: 3.1 (3.1–3.2)
- delete/undefined: 3.2 (3.1–3.2)
- elements/DOUBLE: 18.4 (18.4–18.6)
- elements/ELEMENTS: 13.6 (13.3–14.5)
- elements/HOLEY: 13.6 (13–14.6)
- elements/SMI: 13.7 (13–14.3)
- ic/1-shapes: 21.6 (21.3–21.8)
- ic/2-shapes: 23.2 (23.2–23.4)
- ic/4-shapes: 29.7 (28.7–38.5)
- ic/8-shapes: 91.5 (91.3–92)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (58–58)
- trycatch/naive-try: 164 (164–165)

- IC 8 форм / 1: **×4.24** · 4 формы / 1: ×1.37
- delete / fast: **×33.6** · undefined / fast: ×1.03
- try/catch наивный: ×2.83 · изолированный: 58 = 58
- HOLEY / SMI: ×0.99 · DOUBLE / SMI: ×1.34
