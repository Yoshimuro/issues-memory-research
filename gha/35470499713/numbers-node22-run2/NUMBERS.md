# Числа прогона gha-node22-run2

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-19T21:28:26Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.28** (0.27–0.28) · B: **1.39** (1.38–1.39) · **×5.0** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.39–1.41)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.42** (1.39–1.47)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.27–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.27–0.32)
- без правил / с правилами: **×5.0**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1139.9** → Sparkplug **788.5** → Maglev **789.5** → TurboFan **93.4** · Ignition/TurboFan **×12.2**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 4963–5173

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
| 500 | 1 | ×1.19 | ×0.94 | ×5.11 | ×1.23 | 73% → 62% |
| 500 | 5 | ×1.66 | ×0.94 | ×4.99 | ×1.23 | 63% → 39% |
| 500 | 20 | ×2.72 | ×0.94 | ×5.00 | ×1.25 | 44% → 16% |
| 5000 | 1 | ×1.18 | ×0.90 | ×4.57 | ×1.35 | 74% → 62% |
| 5000 | 5 | ×1.65 | ×0.90 | ×4.61 | ×1.34 | 63% → 39% |
| 5000 | 20 | ×2.57 | ×0.95 | ×4.17 | ×1.30 | 39% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.23 | ×1.64 | ×5.22 | ×1.23 | 75% → 61% |
| 500 | 5 | ×1.78 | ×1.62 | ×5.45 | ×1.24 | 65% → 37% |
| 500 | 20 | ×2.85 | ×1.62 | ×5.18 | ×1.25 | 44% → 16% |
| 5000 | 1 | ×1.26 | ×1.62 | ×5.18 | ×1.37 | 75% → 60% |
| 5000 | 5 | ×1.76 | ×1.62 | ×5.20 | ×1.34 | 65% → 37% |
| 5000 | 20 | ×2.60 | ×1.59 | ×4.12 | ×1.31 | 39% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.09 | ×1.39 | ×1.01 | 73% → 72% |
| 500 | 5 | ×1.08 | ×1.11 | ×1.39 | ×1.02 | 63% → 60% |
| 500 | 20 | ×1.20 | ×1.11 | ×1.46 | ×1.02 | 44% → 36% |
| 5000 | 1 | ×1.02 | ×1.10 | ×1.30 | ×1.01 | 74% → 72% |
| 5000 | 5 | ×1.06 | ×1.09 | ×1.31 | ×1.02 | 63% → 59% |
| 5000 | 20 | ×1.13 | ×1.10 | ×1.27 | ×1.01 | 39% → 34% |

- абсолют batch=500 R=1, мс: mono-llm 0.511 · guard-llm 0.608

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **756 rps** · p50 64 мс · p99 128 мс · errors 0
- guard-llm: **466 rps** · p50 104 мс · p99 208 мс · errors 0
- mixed-mono: **708 rps** · p50 67 мс · p99 136 мс · errors 0
- mono/guard **×1.62** · p99 +63% · mixed к mono -6%

## Мифы (медианы 5 повторов), мс
- delete/delete: 106 (102.8–110.8)
- delete/fast: 3.2 (3.1–3.2)
- delete/undefined: 3.2 (3.1–3.2)
- elements/DOUBLE: 18.4 (18.4–18.6)
- elements/ELEMENTS: 13.7 (12.9–14.4)
- elements/HOLEY: 13.4 (13.2–14.9)
- elements/SMI: 13.6 (13.1–14.3)
- ic/1-shapes: 21.7 (21.5–22)
- ic/2-shapes: 23.2 (23.1–23.3)
- ic/4-shapes: 28.9 (28–36.6)
- ic/8-shapes: 92.2 (91–92.4)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (58–58)
- trycatch/naive-try: 165 (164–165)

- IC 8 форм / 1: **×4.25** · 4 формы / 1: ×1.33
- delete / fast: **×33.1** · undefined / fast: ×1.00
- try/catch наивный: ×2.84 · изолированный: 58 = 58
- HOLEY / SMI: ×0.99 · DOUBLE / SMI: ×1.35
