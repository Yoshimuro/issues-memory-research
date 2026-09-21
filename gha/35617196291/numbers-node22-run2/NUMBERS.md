# Числа прогона gha-node22-run2

```
node v22.23.2 v8 12.4.254.21-node.56 linux/x64
alpine 3.24.2
cpus=4
2026-09-21T15:11:24Z
```

## Прибор (shape-analyzer), p50 прохода чтения, мс
- A: **0.28** (0.28–0.29) · B: **1.39** (1.39–1.4) · **×5.0** · формы 1 / 8
- live №1: `A: true · B: false · форм у B: 8`
- статус читателя: `ref-a score status=81 [function,optimized,turbofan] | ref-b score status=81 [function,optimized,turbofan]`

## Генерации агента
- p1-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.4** (1.39–1.42)
- p2-no-rules: n=15 · битых 0 · некорректных 0 · {"MEGA":15} · форм 8 · p50 **1.42** (1.39–1.47)
- p1-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.28** (0.27–0.29)
- p2-rules: n=15 · битых 0 · некорректных 0 · {"MONO":15} · форм 1 · p50 **0.29** (0.25–0.32)
- без правил / с правилами: **×4.9**

## Лестница ярусов (tier-bench, одна функция), мс
- Ignition **1158** → Sparkplug **800.6** → Maglev **800** → TurboFan **94.1** · Ignition/TurboFan **×12.3**
- на каком вызове ярус (5 прогонов): Sparkplug 2649–2649 · Maglev — · TurboFan 5131–5311

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
| 500 | 1 | ×1.19 | ×0.94 | ×4.84 | ×1.23 | 73% → 62% |
| 500 | 5 | ×1.65 | ×0.94 | ×4.92 | ×1.24 | 63% → 39% |
| 500 | 20 | ×2.72 | ×0.97 | ×4.99 | ×1.28 | 43% → 16% |
| 5000 | 1 | ×1.18 | ×0.92 | ×4.44 | ×1.35 | 73% → 62% |
| 5000 | 5 | ×1.64 | ×0.91 | ×4.44 | ×1.35 | 62% → 38% |
| 5000 | 20 | ×2.51 | ×0.95 | ×3.96 | ×1.33 | 38% → 15% |

### ref-b / ref-a
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.23 | ×1.58 | ×4.95 | ×1.22 | 75% → 61% |
| 500 | 5 | ×1.77 | ×1.62 | ×5.31 | ×1.27 | 64% → 37% |
| 500 | 20 | ×2.81 | ×1.62 | ×5.02 | ×1.29 | 43% → 16% |
| 5000 | 1 | ×1.26 | ×1.64 | ×4.95 | ×1.36 | 75% → 60% |
| 5000 | 5 | ×1.77 | ×1.64 | ×4.96 | ×1.35 | 64% → 37% |
| 5000 | 20 | ×2.57 | ×1.64 | ×4.04 | ×1.33 | 38% → 15% |

### mixed-mono / mono-llm
| batch | R | total | normalize | consume | serialize | доля parse A → B |
|---|---|---|---|---|---|---|
| 500 | 1 | ×1.03 | ×1.11 | ×1.37 | ×1.02 | 73% → 71% |
| 500 | 5 | ×1.10 | ×1.11 | ×1.42 | ×1.02 | 63% → 59% |
| 500 | 20 | ×1.20 | ×1.11 | ×1.47 | ×1.04 | 43% → 36% |
| 5000 | 1 | ×1.03 | ×1.10 | ×1.29 | ×1.02 | 73% → 72% |
| 5000 | 5 | ×1.07 | ×1.12 | ×1.29 | ×1.03 | 62% → 59% |
| 5000 | 20 | ×1.15 | ×1.13 | ×1.29 | ×1.03 | 38% → 33% |

- абсолют batch=500 R=1, мс: mono-llm 0.512 · guard-llm 0.609

## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)
- mono-llm: **737 rps** · p50 65 мс · p99 131 мс · errors 0
- guard-llm: **457 rps** · p50 106 мс · p99 213 мс · errors 0
- mixed-mono: **687 rps** · p50 70 мс · p99 140 мс · errors 0
- mono/guard **×1.61** · p99 +63% · mixed к mono -7%

## Мифы (медианы 5 повторов), мс
- delete/delete: 104.3 (104.3–116.9)
- delete/fast: 3.1 (3.1–3.2)
- delete/undefined: 3.1 (3.1–3.2)
- elements/DOUBLE: 18.6 (18.4–18.7)
- elements/ELEMENTS: 13.6 (12.9–13.8)
- elements/HOLEY: 13.4 (13.3–14.1)
- elements/SMI: 13.3 (13.1–14.4)
- ic/1-shapes: 21.8 (21.6–22)
- ic/2-shapes: 23.5 (23.3–23.7)
- ic/4-shapes: 31.1 (29.1–36.6)
- ic/8-shapes: 92 (91.2–92.3)
- trycatch/honest-plain: 58 (58–58)
- trycatch/honest-try: 58 (58–58)
- trycatch/naive-plain: 58 (58–58)
- trycatch/naive-try: 165 (164–167)

- IC 8 форм / 1: **×4.22** · 4 формы / 1: ×1.43
- delete / fast: **×33.6** · undefined / fast: ×1.00
- try/catch наивный: ×2.84 · изолированный: 58 = 58
- HOLEY / SMI: ×1.01 · DOUBLE / SMI: ×1.40
