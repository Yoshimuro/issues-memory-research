# Демо для доклада: пайплайн V8 (Ignition → Sparkplug → Maglev → TurboFan/Turbolev)

Реальные цифры, замеренные в этом репозитории.

## Окружение

| Что | Версия |
| --- | --- |
| Node.js (nvm) | **v24.18.0** (V8 `13.6.233.17-node.50`) |
| d8 14.x (jsvu, `~/.jsvu/bin/v8-14.9.207`) | **V8 14.9.207** |
| d8 последний (jsvu, `~/.jsvu/bin/v8`) | **V8 15.2.61** |
| Железо | Linux x64, 4 vCPU, Intel Xeon @ 2.80GHz (облачный контейнер — абсолютные числа шумные, соотношения стабильные) |

Установка: `nvm install 24`, `npm i -g jsvu && jsvu --os=linux64 --engines=v8 && jsvu --os=linux64 "v8@14.9.207"`.

Пути к d8 в раннерах можно переопределить переменными `D8_14` и `D8`, число прогонов — `RUNS`.

---

## 1. Maglev жив на Node 24 (`01-maglev-alive.js`)

```
node demos/01-maglev-alive.js        # сам перезапустится с --allow-natives-syntax
```

Функция средней горячести (цикл на 20 итераций), тир проверяется нативами
`%ActiveTierIsMaglev` / `%ActiveTierIsTurbofan` после каждого вызова.

Ожидаемый вывод (node v24.18.0 / V8 13.6, реальный прогон):

```
вызов     164: ignition -> sparkplug
вызов     263: sparkplug -> maglev
вызов   10000: активный тир = maglev, %ActiveTierIsMaglev = true
вызов   10001: maglev -> turbofan
Maglev-окно: вызовы ~263..10000 (9738 вызовов до тир-апа в TurboFan)
```

Диапазон плавает между прогонами (компиляция конкурентная): Maglev наступает на
~130–270-м вызове, TurboFan — на ~9500–10000-м. На ~10k вызовов функция сидит
именно в Maglev. Полный вывод: `results/01-maglev-alive.txt`.

## 2. Лестница тиров через `--max-opt` (`02-sum-dto-bench.js` + `02-tier-ladder-run.js`)

```
RUNS=10 node demos/02-tier-ladder-run.js
```

Ворклоад: массив из 1000 DTO `{price, qty}`, суммирование `price * qty`,
прогрев 500 итераций + 20 000 измеряемых. `--max-opt=N` ограничивает верхний тир.

Ожидаемый вывод (node v24.18.0, 10 прогонов, реальные числа):

```
--max-opt=0 (ignition ): 1417.1 ± 15.9 ms
--max-opt=1 (sparkplug):  999.4 ±  6.9 ms
--max-opt=2 (maglev   ):   61.0 ±  1.8 ms
--max-opt=3 (turbofan ):   41.3 ±  1.9 ms

Sparkplug поверх Ignition:            x1.42
именно Maglev (max-opt=2 vs 1):       x16.39   <-- цифра "сколько даёт именно Maglev"
TurboFan поверх Maglev (3 vs 2):      x1.48
вся лестница (TurboFan vs Ignition):  x34.35
```

Полный вывод: `results/02-tier-ladder.txt`.

## 3. Разгонный сценарий: где Maglev выигрывает (`03-gen-many-functions.js` + `03-maglev-vs-no-maglev-run.js`)

```
node demos/03-gen-many-functions.js          # генерирует 03-many-functions.generated.js
node demos/03-maglev-vs-no-maglev-run.js     # 10 прогонов --maglev vs --no-maglev
```

100 сгенерированных функций средней горячести, по ~940 вызовов каждая,
вперемешку пачками по 10. Параметры подобраны по замеренным порогам тир-апа
(Node 24, тело с циклом ~40 итераций):

- с `--maglev`: Maglev на ~130-м вызове, TurboFan лишь на ~3200-м;
- с `--no-maglev`: TurboFan уже на ~1000-м вызове.

При ~940 вызовах конфиг с Maglev работает в Maglev-коде, конфиг без — в
Ignition/Sparkplug. Ожидаемый вывод (реальный прогон, 10 повторов):

```
--maglev    : 41.2 ± 3.3 ms
--no-maglev : 52.1 ± 3.3 ms
выигрыш Maglev на разгоне: x1.26
```

Важный вывод для доклада: при 3000+ вызовах на функцию выигрыш исчезает —
без Maglev TurboFan приходит раньше (тот же бюджет достаётся сразу 4-му тиру),
и его код быстрее Maglev-кода. Maglev выигрывает именно на разгоне/старте,
а не в стационаре. Полный вывод: `results/03-maglev-vs-no-maglev.txt`.

## 4. IC-переходы mono → poly → mega (`04-ic-shapes.js` + `04-log-ic-run.js`)

```
node demos/04-log-ic-run.js        # запускает d8 14.9 с --log-ic
```

Внимание: старый флаг `--trace-ic` из V8 удалён — теперь это `--log-ic`
(пишет в v8.log, формат для tools/ic-processor). `getX(o){return o.x}` кормим
пятью шейпами по 400 вызовов.

Ожидаемый вывод (d8 / V8 14.9.207, реальный прогон):

```
строка 4: 0 (uninitialized) -> 1 (MONOMORPHIC)    # шейп 1
строка 4: 1 (MONOMORPHIC)   -> P (POLYMORPHIC)    # шейп 2
строка 4: P (POLYMORPHIC)   -> P (POLYMORPHIC)    # шейп 3
строка 4: P (POLYMORPHIC)   -> P (POLYMORPHIC)    # шейп 4 (предел полиморфизма = 4 мапы)
строка 4: P (POLYMORPHIC)   -> N (MEGAMORPHIC)    # шейп 5
```

Расшифровка состояний: `0` uninitialized, `1` monomorphic, `P` polymorphic,
`N` megamorphic. Отчёт: `results/04-ic-transitions.txt`, сырой лог: `results/04-ic-v8.log`.

## 5. Turbolev в d8 14.x (`05-turbolev-run.js`)

```
node demos/05-turbolev-run.js
```

Ожидаемый вывод (реальный прогон):

```
=== d8 14.x: V8 14.9.207 ===
--turbolev: есть, по умолчанию ВЫКЛЮЧЕН (--no-turbolev)
   (use Turbolev (= Maglev + Turboshaft combined) as the 4th tier compiler instead of Turbofan)
--turboshaft: есть, по умолчанию ВКЛЮЧЕН (--turboshaft)

--no-turbolev  :  44.3 ±  5.8 ms
--turbolev     : 119.7 ± 12.0 ms
(без флагов)   :  40.7 ±  0.6 ms   # совпадает с --no-turbolev
```

**Фиксация для доклада (важно!):** Turbolev в V8 14.9 и даже в 15.2 **НЕ включен
по умолчанию** (`default: --no-turbolev`); по умолчанию 4-й тир — TurboFan
(с Turboshaft-фазами, `--turboshaft` включен по умолчанию ещё с V8 ~12.x).

Бонус-наблюдение на бенче из демо 2:

- V8 14.9: Turbolev в ~2.7 раза медленнее TurboFan (119.7 против 44.3 мс), его код
  лежит между Maglev (`--max-opt=2` ≈ 146 мс) и TurboFan;
- V8 15.2: разрыв почти закрыт — 41.6 ± 2.8 мс против 36.0 ± 1.7 мс (~15%).

Полный вывод: `results/05-turbolev.txt`.

---

## Структура

```
demos/
  01-maglev-alive.js               # тиры функции на Node 24 (нативы V8)
  02-sum-dto-bench.js              # ворклоад: 1000 DTO, 20k итераций (node и d8)
  02-tier-ladder-run.js            # раннер: --max-opt=0/1/2/3
  03-gen-many-functions.js         # генератор программы со 100 функциями
  03-many-functions.generated.js   # сгенерированная программа (детерминированная)
  03-maglev-vs-no-maglev-run.js    # раннер: --maglev vs --no-maglev, 10 прогонов
  04-ic-shapes.js                  # d8: getX + 5 шейпов
  04-log-ic-run.js                 # раннер: d8 --log-ic + разбор v8.log
  05-turbolev-run.js               # раннер: флаги turbolev/turboshaft + бенч
  lib/stats.js, lib/run.js         # среднее/ст.отклонение, запуск процессов
  results/                         # реальные результаты прогонов (этот контейнер)
```
