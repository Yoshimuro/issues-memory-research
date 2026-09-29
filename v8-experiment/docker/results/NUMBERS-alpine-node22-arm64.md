# Числа прогона alpine-node22

```
node v22.23.2 v8 12.4.254.21-node.56 linux/arm64
alpine 3.24.2
cpus=10
2026-09-19T21:12:56Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.12** (0.11–0.12) · B: **0.83** (0.81–0.84) · **×6.9** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **0.79** (0.77–0.82)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **0.81** (0.78–0.82)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.12** (0.12–0.12)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.12** (0.11–0.13)
- без правил / с правилами: **×6.8**

- контроль ref-b до/после серии: 0.78 · 0.86 · 0.8 · 0.81 · 0.81 · 0.83 · первая серия забракована (помеха на старте прогона), сохранена в candidates-disturbed.jsonl

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **482.3** → Sparkplug **763.3** → Maglev **762.1** → TurboFan **39.9** · Ignition/TurboFan **×12.1**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 4652–4984

## A/B под --turbolev
- флага в этой версии V8 нет

## wrong map (5 прогонов demo-wrongmap + прибор)
- analyzer-ref-a (sfi: 1
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
| 500 | 1 | ×1.25 | ×1.00 | ×5.11 | ×1.32 | 67% → 53% |
| 500 | 5 | ×1.91 | ×1.00 | ×5.25 | ×1.39 | 57% → 30% |
| 500 | 20 | ×3.09 | ×1.00 | ×5.19 | ×1.38 | 35% → 12% |
| 5000 | 1 | ×1.27 | ×0.97 | ×4.67 | ×1.48 | 67% → 52% |
| 5000 | 5 | ×1.84 | ×1.01 | ×4.53 | ×1.46 | 55% → 30% |
| 5000 | 20 | ×2.83 | ×0.95 | ×4.30 | ×1.48 | 32% → 11% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.34 | ×1.64 | ×5.11 | ×1.36 | 68% → 53% |
| 500 | 5 | ×1.95 | ×1.53 | ×5.27 | ×1.36 | 57% → 30% |
| 500 | 20 | ×3.12 | ×1.64 | ×5.12 | ×1.32 | 35% → 12% |
| 5000 | 1 | ×1.36 | ×1.55 | ×5.10 | ×1.50 | 69% → 52% |
| 5000 | 5 | ×1.96 | ×1.63 | ×5.10 | ×1.48 | 57% → 29% |
| 5000 | 20 | ×2.93 | ×1.58 | ×4.36 | ×1.46 | 32% → 11% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.04 | ×1.05 | ×1.44 | ×1.00 | 67% → 64% |
| 500 | 5 | ×1.12 | ×1.15 | ×1.50 | ×1.03 | 57% → 51% |
| 500 | 20 | ×1.24 | ×1.10 | ×1.48 | ×1.03 | 35% → 29% |
| 5000 | 1 | ×1.03 | ×1.07 | ×1.37 | ×1.04 | 67% → 64% |
| 5000 | 5 | ×1.09 | ×1.23 | ×1.33 | ×1.00 | 55% → 51% |
| 5000 | 20 | ×1.19 | ×1.04 | ×1.33 | ×1.02 | 32% → 27% |

- абсолют batch=500 R=1, мс: mono-llm 0.189 · guard-llm 0.237

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **2101 rps** · p50 23 мс · p99 46 мс · errors 0
- guard-llm: **1105 rps** · p50 44 мс · p99 88 мс · errors 0
- mixed-mono: **1913 rps** · p50 25 мс · p99 51 мс · errors 0
- mono/guard **×1.90** · p99 +91% · mixed к mono -9%

## Мифы (медианы 5 повторов), мс
- delete/delete: 44.1 (42.9–47.7)
- delete/fast: 1.6 (1.6–2.3)
- delete/undefined: 1.6 (1.5–1.8)
- elements/DOUBLE: 11.5 (11.5–11.8)
- elements/ELEMENTS: 7.8 (7.6–8)
- elements/HOLEY: 7.8 (7.6–8)
- elements/SMI: 6.9 (6.8–7.2)
- ic/1-shapes: 10.3 (10–10.4)
- ic/2-shapes: 11.1 (10.9–11.6)
- ic/4-shapes: 13.4 (13.4–14.8)
- ic/8-shapes: 34.6 (34.5–35.4)
- trycatch/honest-plain: 14 (14–14)
- trycatch/honest-try: 14 (14–15)
- trycatch/naive-plain: 23 (22–24)
- trycatch/naive-try: 64 (61–69)

- IC 8 форм / 1: **×3.36** · 4 формы / 1: ×1.30
- delete / fast: **×27.6** · undefined / fast: ×1.00
- try/catch наивный: ×2.78 · изолированный: 14 = 14
- HOLEY / SMI: ×1.13 · DOUBLE / SMI: ×1.67
