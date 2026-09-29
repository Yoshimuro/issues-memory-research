# -*- coding: utf-8 -*-
# Скелет по 07-storyboard-final: мастер-слайд (A сверху / B снизу / колонка шапок справа), схемы 1–13 на своих слайдах.
import sys, os
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, 'build.py'), encoding='utf-8').read().split('# ================= СЛАЙДЫ')[0])
from PIL import Image

X0, X1 = 0.12, 10.2          # зона содержимого
CW = X1 - X0
Y0, Y1 = 1.3, 6.9
RX, RW = 10.45, 2.51          # колонка шапок
BRED = '8A1538'
SLOTS = (('форма', 2), ('чтение', 3), ('путь', 5), ('сервер', 6), ('автор', 7))

def ab_pairs(sid):
    raw = SL[sid]['Шапки A/B']
    if not raw or 'нет' in raw[:16]:
        return None
    raw = re.split(r' — (?=[а-яё])| \(', raw)[0]
    out = {}
    for item in raw.split(' · '):
        k, _, v = item.strip().partition(' ')
        va, _, vb = v.partition('/')
        out[k] = (va.strip() or '—', (vb or va).strip() or '—')
    return out

def ctext(s, x, y, w, h, runs, size, align='c', anchor='m'):
    """runs: [(text, color)] в одну строку."""
    tb = s.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h)); tf = tb.text_frame
    tf.word_wrap = True; tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]; p.alignment = PP_ALIGN.CENTER if align == 'c' else PP_ALIGN.LEFT
    for t, col in runs:
        r = p.add_run(); r.text = t; r.font.size = Pt(size); r.font.name = 'X5 Sans Medium'; r.font.color.rgb = RGBColor.from_string(col)

def column(s, sid):
    st = ab_pairs(sid) or {}
    for i, (k, node) in enumerate(SLOTS):
        y = Y0 + i * 0.8
        a, b = st.get(k, ('—', '—'))
        filled = a != '—' or b != '—'
        if filled:
            clone(s, 'white', RX, y, RW, 0.72)
        else:
            sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(RX), Inches(y), Inches(RW), Inches(0.72))
            sh.adjustments[0] = 0.18; sh.fill.solid(); sh.fill.fore_color.rgb = RGBColor.from_string('ECECEC')
            sh.line.color.rgb = RGBColor.from_string('C4C8CE'); sh.line.dash_style = MSO_LINE.DASH; sh.shadow.inherit = False
        text(s, RX + 0.15, y + 0.06, RW - 0.3, 0.2, f'{k}', size=9, color=GREY)
        text(s, RX + 0.15, y + 0.06, RW - 0.3, 0.2, f'узел {node}', size=9, color=GREY, align='r')
        long = len(a) + len(b) > 22
        ctext(s, RX + 0.1, y + 0.26, RW - 0.2, 0.42,
              [(a, GREEN if filled else '9CA3AF'), ('  /  ', '9CA3AF'), (b, BRED if filled else '9CA3AF')], size=9 if long else 15)
    todo(s, RX, Y0 + 5 * 0.8, RW, Y1 - (Y0 + 5 * 0.8), 'мини-карта: 12 шагов, текущий обведён', 'КАРТА')

def light(sid, bg='green', title=None):
    s = prs.slides.add_slide(LAY[bg])
    set_title(s, title or SL[sid]['title'])
    tt = s.shapes.title
    tt.left, tt.top, tt.width, tt.height = Inches(0.12), Inches(0.40), Inches(11.0), Inches(0.58)
    drop_empty_placeholders(s)
    text(s, 11.4, 0.42, 1.55, 0.3, sid, size=11, color=GREY, align='r')
    column(s, sid); notes(s, sid)
    return s

def schema(s, n, x, y, w, h, crop=None, tag=None):
    """Схема из 07-storyboard-final как картинка-ориентир (перерисовать в стиле X5)."""
    src = os.path.join(HERE, 'sb', f'schema{n:02d}.png')
    im = Image.open(src)
    if crop:
        W, H = im.size
        im = im.crop((0, int(H * crop[0]), W, int(H * crop[1])))
        src = os.path.join(HERE, 'sb', f'schema{n:02d}_{int(crop[0]*100)}.png'); im.save(src)
    W, H = im.size
    k = min(w / W, h / H); pw, ph = W * k, H * k
    px, py = x + (w - pw) / 2, y + (h - ph) / 2
    s.shapes.add_picture(src, Inches(px), Inches(py), Inches(pw), Inches(ph))
    lab = tag or f'07 · схема {n}'
    lw = 0.075 * len(lab) + 0.3
    clone(s, 'lime', px + pw - lw - 0.08, py + 0.08, lw, 0.26)
    text(s, px + pw - lw - 0.08, py + 0.08, lw, 0.26, lab, size=9, color=GREEN, align='c', anchor='m')

def zones(s, y, h, a, b, size=18, labels=('A · ?? null', 'B · условный спред'), gapy=0.2, x=X0, w=None, **kw):
    """Мастер сториборда: зона A сверху (зелёная), зона B снизу (красная)."""
    w = w or CW
    for i, (key, lab, paras, col) in enumerate((('white', labels[0], a, GREEN), ('pinkcard', labels[1], b, BRED))):
        yy = y + i * (h + gapy)
        clone(s, key, x, yy, w, h)
        lw = 0.105 * len(lab) + 0.45
        clone(s, 'lime' if i == 0 else 'pink', x + 0.22, yy + 0.18, lw, 0.38)
        text(s, x + 0.22, yy + 0.18, lw, 0.38, lab, size=12, color=col, align='c', anchor='m', font='X5 Sans Medium')
        text(s, x + 0.35, yy + 0.62, w - 0.7, h - 0.75, paras, size=size, color=GREEN, anchor='m', **kw)

def row(s, key, items, y, h, x0=X0, x1=X1, gapx=0.25, **kw):
    n = len(items); w = (x1 - x0 - gapx * (n - 1)) / n
    for i, it in enumerate(items):
        card(s, key, x0 + i * (w + gapx), y, w, h, it, **kw)

def breather(n, k, sch=None):
    s = prs.slides.add_slide(LAY['white'])
    set_title(s, f'Передышка {k} · карта, 5 секунд')
    drop_empty_placeholders(s)
    if sch:
        schema(s, sch, 0.47, 1.4, 12.38, 5.2)
    else:
        todo(s, 0.47, 1.4, 12.38, 5.2, f'карта доклада · проявлены шаги 1–{n}, дальше приглушено (в 07 этого состояния нет — собрать по образцу схем 3–4)', 'СХЕМА')
    s.notes_slide.notes_text_frame.text = 'ПЕРЕДЫШКА. ' + NODES[n]['breather']

_todo = todo
def todo(s, x, y, w, h, label, kind='АССЕТ'):
    if h >= 1.0:
        return _todo(s, x, y, w, h, label, kind)
    sh = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(h))
    sh.adjustments[0] = 0.18; sh.fill.solid(); sh.fill.fore_color.rgb = RGBColor.from_string('F2F2F2')
    sh.line.color.rgb = RGBColor.from_string('9CA3AF'); sh.line.width = Pt(1.5); sh.line.dash_style = MSO_LINE.DASH; sh.shadow.inherit = False
    text(s, x + 0.2, y, w - 0.4, h, f'**{kind}** · {label}', size=11, color=GREY, align='c', anchor='m')

def map_todo(s, y, h, state):
    todo(s, X0, y, CW, h, f'карта доклада (07 · схема 1) — {state}', 'КАРТА')

# ================= СЛАЙДЫ =================
s = prs.slides.add_slide(LAY['title'])
set_title(s, 'V8 для самых маленьких')
for ph in s.placeholders:
    if ph.placeholder_format.type != 1:
        ph.text_frame.text = 'Что за лев этот турболев?'
text(s, 0.12, 4.35, 6.2, 0.6, 'В описании доклада часть текста написал агент. Честно.', size=13, color=PALE)
text(s, 0.12, 5.21, 5.5, 0.9, ['**Александр Зайцев**', 'HolyJS 2026 Autumn · 24.10.2026'], size=16, color=WHITE, gap=2)
notes(s, '1.1')

# --- узел 1
s = light('1.2', 'white')
zones(s, Y0, 2.1, ['`referrer: raw.referrer ?? null,`', '`trialUntil: raw.trialUntil ?? null,`', '`teamId: raw.teamId ?? null,`'],
      ['`...(raw.referrer && { referrer: raw.referrer }),`', '`...(raw.trialUntil && { trialUntil: raw.trialUntil }),`', '`...(raw.teamId && { teamId: raw.teamId }),`'], size=19, gap=4)
text(s, X0 + 5.6, Y0 + 0.2, 4.0, 0.35, 'пять верхних строк одинаковы · поле есть всегда', size=11, color=GREY, align='r')
text(s, X0 + 5.6, Y0 + 2.5, 4.0, 0.35, 'те же три поля · поля нет, если нет значения', size=11, color=GREY, align='r')
row(s, 'blue', ['чексуммы равны', 'тесты зелёные', 'ревью: approve'], 5.95, 0.95, size=18, align='c')

s = light('1.3', 'green')
zones(s, Y0, 1.45, ['**0.12 мс**'], ['**0.79 мс**'], size=44, gapy=0.15, w=6.3)
big(s, X0 + 6.5, Y0 + 0.8, 3.3, 1.45, '~×6.6', size=48)
todo(s, X0, 4.55, 6.3, 2.35, 'R1 · прогон shape-analyzer на ref-a.js и ref-b.js: shapes / ic / p50 / correct', 'ЗАПИСЬ')
text(s, X0 + 6.6, 4.55, 3.2, 2.35, ['`lab/shape-analyzer.js`', 'Node 24.18.0 / V8 13.6', 'p50 прохода чтения по 50 000 собранных объектов'], size=14, color=GREY, gap=6, anchor='m')

s = light('1.4', 'white')
card(s, 'pinkcard', X0, Y0, 6.4, 1.15, '`[bailout … reason: wrong map]`', size=22, align='c')
card(s, 'dark', X0 + 6.65, Y0, CW - 6.65, 1.15, 'улика, не причина', size=19, color=WHITE, align='c')
text(s, X0, 2.55, CW, 0.35, 'читатель score(): сначала полные записи, потом без хвостовых полей · у читателя на A строки нет (5/5) · `lab/demo-wrongmap.js`', size=12, color=GREY)
schema(s, 2, X0, 3.0, CW, 3.9)

# --- узел 2
divider(2)
s = light('2.1', 'grey')
clone(s, 'dark', X0, Y0, 3.6, 5.6)
text(s, X0 + 0.3, Y0 + 0.4, 3.0, 1.2, 'форма', size=50, color=WHITE, font='X5 Sans Medium')
text(s, X0 + 0.3, 5.7, 3.0, 0.9, ['hidden class', 'в трейсе — `map`'], size=15, color=PALE)
bullets(s, 4.3, 1.5, 5.9, ['внутреннее описание объекта: какие поля, в каком порядке добавлены', 'одинаково собранные объекты делят одно описание'], size=20, step=1.6)
card(s, 'white', 4.3, 4.9, 2.8, 2.0, ['**A**: 8 полей', 'форм: **1**'], size=20, align='c')
card(s, 'pinkcard', 7.4, 4.9, 2.8, 2.0, ['**B**', 'форм: **?**'], size=20, align='c')

s = light('2.2', 'white')
schema(s, 6, X0, Y0, CW, 4.65)
row(s, 'lime', ['A: одна карточка — **1 форма**'], 6.1, 0.8, x1=X0 + 4.8, size=17, align='c', pad=0.15)
row(s, 'pink', ['B: три развилки — **2³ = 8 форм**'], 6.1, 0.8, x0=X0 + 5.05, size=17, align='c', pad=0.15, color=BRED)

s = light('2.3', 'green')
todo(s, X0, Y0, 6.3, 5.6, 'LIVE №1 · `node --allow-natives-syntax lab/demo-samemap.js` → true / false / «форм у B: 8». Фолбэк-скрин R3 — следующим кадром', 'LIVE-ДЕМО')
card(s, 'dark', 6.95, Y0, 3.25, 2.9, ['`%HaveSameMap`', '', 'A(x), A(y) → **true**', 'B(x), B(y) → **false**'], size=17, color=WHITE, gap=4)
clone(s, 'white', 6.95, 4.45, 3.25, 2.45)
big(s, 6.95, 4.45, 3.25, 2.45, '1 vs 8', size=44)

s = light('2.4', 'white')
map_todo(s, Y0, 5.6, 'проявлены шаги 1–2: «форма объекта» A 1 форма / B 8 форм, расходятся зелёная и красная дорожки')

# --- узел 3
divider(3)
s = light('3.1', 'green')
card(s, 'white', X0, Y0, 4.8, 2.9, ['сборка · `normalize`', '**×0.93–1.02** — if после литерала', '**×1.6** — спред с первого слайда'], size=22, align='c')
card(s, 'pinkcard', X0 + 5.03, Y0, 4.8, 2.9, ['чтение · `consume`', '**×5.1–5.4**', 'у обеих записей · платит чтение'], size=30, align='c', color=BRED)
schema(s, 7, X0, 4.4, 6.6, 2.5, crop=(0.63, 1.0), tag='07 · схема 7, низ')
text(s, X0 + 6.85, 4.4, 2.95, 2.5, ['lab/real · Node 24', 'восемь форм сборку не удорожают; дорог сам спред', 'спред: ×1.53–1.72 · источник: docker/out/alpine-node24/NUMBERS.md'], size=13, color=GREY, anchor='m', gap=4)

s = light('3.2', 'grey')
schema(s, 7, X0, Y0, CW, 4.7, crop=(0.0, 0.60), tag='07 · схема 7, верх')
row(s, 'dark', ['термин: **место чтения запоминает формы** (inline cache) · память у места, не у объекта'], 6.15, 0.75, size=15, color=WHITE, align='c', pad=0.15)

s = light('3.3', 'white')
todo(s, X0, Y0, 6.3, 3.3, 'R4 · 3–5 строк LoadIC по полю u.plan для B (1 → P → N) + одна строка для A; колонка состояния подсвечена', 'СКРИН')
card(s, 'dark', 6.95, Y0, 3.25, 3.3, ['**1 → P → N**', 'N — на пятой форме', '', 'A: одна строка, MONO'], size=22, color=WHITE, align='c')
text(s, X0, 4.7, CW, 0.4, '`node --log-ic --no-logfile-per-isolate --logfile=ic.log`', size=13, color=GREY)
map_todo(s, 5.2, 1.7, 'шаг 3 «место чтения»: A MONO · быстрый / B MEGA · словарь; у шага 2 подпись «сборка ×0.93–1.02»')

s = dark('Цена объяснена. Улика — ещё нет', 'Два вопроса', ['1. Спасёт ли компилятор B?', '2. Растёт ли цена с числом чтений?'], sid='3.4')
breather(3, 1)

# --- узел 4
divider(4)
s = light('4.1', 'green', title='Спасёт ли компилятор B?')
clone(s, 'dark', X0, Y0, 3.2, 5.6)
big(s, X0, Y0, 3.2, 5.6, 'Нет.', size=72, color=WHITE)
zones(s, Y0, 1.75, ['**0.12 мс**'], ['**0.79 мс**'], size=36, x=3.8, w=6.4, labels=('A', 'B'))
card(s, 'blue', 3.8, 5.2, 6.4, 0.85, 'горячий цикл = давно скомпилированный код', size=17, align='c', pad=0.15)
text(s, 3.8, 6.2, 6.4, 0.6, 'у компилятора есть кое-что своё → по вызовам', size=15, color=GREY, align='c', anchor='m')

s = light('4.2', 'white', title='Ярус: четыре способа исполнить одну функцию')
schema(s, 8, X0, Y0, CW, 4.75)
todo(s, X0, 6.15, CW, 0.75, 'схему перерисовать: 8 — заведение записей (не Sparkplug); замер на читателе: Sparkplug 665–1011 · Maglev 923–1170 · TurboFan 13 100–13 600 · + R5 байткод', 'ПРАВКА')

s = light('4.3', 'green')
clone(s, 'white', X0, Y0, CW, 5.6)
big(s, X0 + 0.3, Y0 + 0.2, CW - 0.6, 1.5, '505 → 775 → 70 → 38 мс', size=46)
row(s, 'blue', ['`--max-opt=0/1/2/3`', '**×13.5**', 'одна функция, не A против B'], 3.2, 1.3, x0=X0 + 0.4, x1=X1 - 0.4, size=17, align='c', pad=0.15)
todo(s, X0 + 0.4, 4.75, 5.6, 1.85, 'четыре столбика по ярусам (в 07 — внутри схемы 8)', 'ГРАФИК')
text(s, X0 + 6.2, 4.75, 3.2, 1.85, ['node:24.21.0-alpine · `docker/tier-bench.js`', 'Sparkplug медленнее Ignition — как намерил', 'x64-прогон — GitHub Actions, сверить'], size=14, color=GREY, anchor='m')

s = light('4.4', 'grey')
card(s, 'shadow', X0, Y0, 4.8, 5.6, ['**Ignition · Sparkplug**', '', 'читают записи мест чтения,', 'ничего не предполагают'], size=21)
card(s, 'dark', X0 + 5.03, Y0, 4.8, 5.6, ['**Maglev · TurboFan**', '', 'вшивают в машинный код ставку «сюда приходит одна форма»', '', 'проверка — одно сравнение'], size=21, color=WHITE)

# --- узел 5
divider(5)
s = light('5.1', 'white', title='Ставка не сыграла: wrong map')
schema(s, 9, X0, Y0, CW, 4.75)
row(s, 'dark', ['термин: **деопт**'], 6.15, 0.75, x1=X0 + 3.2, size=17, color=WHITE, align='c', pad=0.15)
todo(s, X0 + 3.45, 6.15, CW - 3.45, 0.75, 'R2 · `--trace-deopt demo-wrongmap.js ref-b.js | grep "JSFunction score"`', 'СКРИН')

s = light('5.2', 'green', title='Стационар: общий путь')
clone(s, 'white', X0, Y0, CW, 5.6)
big(s, X0 + 0.3, Y0 + 0.2, CW - 0.6, 1.6, '0.79 = цена общего пути', size=44)
row(s, 'blue', ['после отката — перекомпиляция без ставки на одну форму', 'в приборе ставки не было: у читателя B 0 деоптов, TurboFan — и всё равно ×4', 'деопт — событие, оно заканчивается'], 3.3, 1.9, x0=X0 + 0.4, x1=X1 - 0.4, size=16, align='c', pad=0.2)
text(s, X0 + 0.4, 5.5, CW - 0.8, 0.8, 'читатель оптимизирован TurboFan у A и у B — проверено', size=14, color=GREY, align='c', anchor='m')

s = light('5.3', 'grey', title='Улика прочитана')
card(s, 'pinkcard', X0, Y0, 4.8, 2.4, '`reason: wrong map`', size=26, align='c')
card(s, 'lime', X0, 3.95, 2.3, 2.95, ['**map**', '= форма', '(узел 2)'], size=20, align='c')
card(s, 'lime', X0 + 2.5, 3.95, 2.3, 2.95, ['**wrong**', '= ставка', '(узел 4)'], size=20, align='c')
clone(s, 'dark', X0 + 5.03, Y0, 4.8, 5.6)
big(s, X0 + 5.03, Y0 + 0.3, 4.8, 2.0, '2008', size=88, color=WHITE)
text(s, X0 + 5.4, 3.9, 4.06, 2.6, ['формы и записи мест чтения — с первого релиза V8', '', 'старше всех ступеней лестницы'], size=18, color=PALE, align='c')
breather(5, 2, sch=3)

# --- узел 6
divider(6)
s = light('6.1', 'white', title='Кривая R: цена растёт с числом чтений')
text(s, X0, 1.12, CW, 0.5, '200k NDJSON · parse → normalize → consume (R проходов) → serialize · процесс на ячейку · прогрев 300 / замер 1000 / 5 повторов · чексум 90/90', size=11, color=GREY)
schema(s, 10, X0, 1.7, CW, 4.2)
row(s, 'white', [['R=1 · **+29–31%**'], ['R=5 · **×1.8**'], ['R=20 · **×3.1–3.3**']], 6.05, 0.85, size=18, align='c', pad=0.12)

s = light('6.2', 'green', title='HTTP: 2302 против 1180')
zones(s, Y0, 1.45, ['**2302 rps**'], ['**1180 rps**'], size=44, gapy=0.15, labels=('A · 1 форма', 'B · 8 форм'), w=6.3)
big(s, X0 + 6.5, Y0 + 0.8, 3.3, 1.45, '×1.95', size=48)
row(s, 'blue', ['p50 · 21 → 41 мс', 'p99 · 42 → 82 мс (**+95%**)'], 4.55, 0.85, x1=X0 + 6.3, size=16, align='c', pad=0.12)
todo(s, X0, 5.6, 6.3, 1.3, 'R7 · bench-http.sh, итоговые таблицы autocannon (Req/Sec, p99)', 'ЗАПИСЬ')
text(s, X0 + 6.6, 4.55, 3.2, 2.35, ['node:http', '`autocannon -c 50 -d 20`', 'batch 1000 · R=5', 'термин: **p99**'], size=14, color=GREY, gap=4, anchor='m')

s = light('6.3', 'grey', title='Где это не важно')
row(s, 'shadow', [['**ingest без чтений**', 'R≈0: +6–10% (if-guard)', '+13–18% (спред)'], ['**I/O-bound**', 'ждёт базу десятки мс — не видно ни в p50, ни в p99'], ['**малые батчи, R=1**', '0.17 vs 0.22 мс на 500 записей']], Y0, 3.0, size=16, gap=6, pad=0.28)
card(s, 'dark', X0, 4.55, CW, 1.35, 'читаете нормализованное — от четверти до трёх раз; только складываете — единицы процентов', size=18, color=WHITE, align='c')
text(s, X0, 6.05, CW, 0.8, '«упрётся в базу» — верно при R≈0 · мой consume плотный — калибруйте R на свой профиль', size=13, color=GREY, align='c', anchor='m')

s = prs.slides.add_slide(LAY['white'])
set_title(s, '[резерв] Как мерили — и где d8 врёт')
drop_empty_placeholders(s)
bullets(s, 0.6, 1.4, 12.0, ['чем d8 / микробенч отличается от прода — и почему числа всё равно переносятся', 'как собирались метрики: процесс на ячейку, прогрев, медианы, чексуммы', 'ловушки замера V8: %-интринсики, --no-turbofan, общий процесс, фон харнесса'], size=20, step=1.2)
todo(s, 0.6, 5.1, 12.0, 1.4, 'слайд из обсуждения с Владом (6.09) — ни в сценарии 06, ни в сториборде 07 его нет; решить: сюда, в Q&A-резерв или в PITFALLS.md', 'РЕШИТЬ')
s.notes_slide.notes_text_frame.text = 'Замечание Влада от 6.09: доработать момент с тестированием на d8, чем отличается от реального прода; рассказать больше про сбор метрик и ловушки замера с v8/d8. В 06 и 07 отдельного блока нет.'

# --- узел 7
divider(7)
s = light('7.1', 'green', title='Кто написал B?')
todo(s, X0, Y0, 5.6, 5.6, 'R8 · тикет P1 → `claude -p --model opus` (свежая сессия) → код → shape-analyzer. Запись по умолчанию, live только при уверенной сети', 'ЗАПИСЬ / LIVE')
for i, t in enumerate(('тикет: normalizeUser · 5 обязательных · 3 опциональных · дефолты', '`claude -p --model opus` · свежая сессия', '4 ветки × 15 = **60** генераций', 'прибор валидирован на A/B: 0.12 / 0.79 мс')):
    card(s, 'shadow', 6.2, Y0 + i * 1.42, 4.0, 1.3, t, size=15, pad=0.25)

s = light('7.2', 'white', title='Без правил: 30/30 MEGA — и ни одной ошибки')
clone(s, 'pinkcard', X0, Y0, CW, 5.6)
big(s, X0 + 0.3, Y0 + 0.15, CW - 0.6, 1.7, '30/30 MEGA', size=72, color=BRED)
row(s, 'pink', ['**8** форм', 'p50 **0.79 мс** (0.76–0.83)', '**0** битых · **0** некорректных из 60'], 3.4, 1.6, x0=X0 + 0.4, x1=X1 - 0.4, size=17, align='c', pad=0.15)
big(s, X0 + 0.4, 5.3, CW - 0.8, 1.2, '«Ревью пропустит»', size=28)

s = light('7.3', 'white', title='Две записи — одна судьба')
schema(s, 11, X0, Y0, CW, 2.9, crop=(0.0, 0.47), tag='07 · схема 11, верх')
zones(s, 4.3, 0.95, ['`...(raw.referrer && { referrer: raw.referrer })` ×3'], ['`if (src.referrer != null) result.referrer = src.referrer` ×3'], size=14, gapy=0.1, labels=('B с первого слайда', 'агент, 30/30'))
row(s, 'blue', ['спред 0/30 · Object.assign 0/30 · if-guard 30/30', '0.79 ∈ [0.76–0.83]'], 6.4, 0.5, size=12, align='c', pad=0.05)

s = light('7.4', 'grey', title='Чей код стоял в сервисе')
card(s, 'pinkcard', X0, Y0, CW, 1.6, '1180 rps = guard-llm = `out/p1-no-rules/candidate_1.js`', size=21, align='c')
row(s, 'shadow', [['P1 / P2', '**15/15 · 15/15 MEGA**'], ['один вендор', '**N = 15**'], ['напарник (2302)', '**— дальше**']], 3.15, 1.7, size=16, align='c', pad=0.2)
map_todo(s, 5.1, 1.8, 'шаг 7 «агент»: автор B — агент без правил, 30/30 · автор A — ?')

# --- узел 8
divider(8)
s = dark('30/30 — без единого примера в промпте', '«Добавь ключ, только если есть значение»', ['Частота в корпусе — нет замера', 'В том же корпусе перф-советы: живые и мёртвые вперемешку'], sid='8.1', big_size=40)

s = light('8.2', 'green', title='Живое: одна строка матрицы')
schema(s, 12, X0, Y0, CW, 4.3)
row(s, 'blue', ['9 / 10 строк не зависят от рантайма', '`delete` → словарный режим ×28–×29'], 5.75, 0.8, size=16, align='c', pad=0.12)
text(s, X0, 6.6, CW, 0.3, 'Node 20 · 22 · 24 · d8 11.3→15.2 · 300 прогонов · процесс на кейс · таблица матрицы — только фоном', size=11, color=GREY, align='c')

s = light('8.3', 'white', title='Мёртвое — и стык с объектами')
clone(s, 'shadow', X0, Y0, 4.8, 3.4)
text(s, X0 + 0.35, Y0 + 0.25, 4.1, 0.7, '«try/catch дорогой»', size=24, font='X5 Sans Medium')
text(s, X0 + 0.35, 2.5, 4.1, 2.0, ['наивный бенч: **×2.8–3.0**', 'изолированные процессы: **14 = 14 мс**'], size=18, gap=8)
todo(s, X0 + 5.03, Y0, 4.8, 3.4, 'два прогона try/catch из эксп. 3: наивный в одном процессе / изолированный', 'СКРИН')
card(s, 'dark', X0, 4.95, CW, 1.4, 'Норма «условный ключ» нарушает живое правило. Агент живое от мёртвого не отличает', size=18, color=WHITE, align='c')
text(s, X0, 6.45, CW, 0.4, '(Node 22 с 22.9 — без Maglev: PITFALLS)', size=12, color=GREY, align='c')
breather(8, 3, sch=4)

# --- узел 9
divider(9)
s = light('9.1', 'grey', title='Контракт: четыре правила')
rules = [['Один набор полей в одном порядке; нет значения → `null`'], ['После создания не добавлять и не удалять', '(`delete` ×28–×29)'], ['Однородные массивы'], ['Стабильные типы аргументов и возвратов']]
for i, r in enumerate(rules):
    x, y = (X0, X0 + 5.03)[i % 2], (Y0, 3.6)[i // 2]
    card(s, 'shadow', x, y, 4.8, 2.1, r, size=17, pad=0.4)
    clone(s, 'badge', x + 4.0, y + 1.32, 0.6, 0.6)
    text(s, x + 4.0, y + 1.32, 0.6, 0.6, str(i + 1), size=17, align='c', anchor='m', font='X5 Sans Medium')
card(s, 'blue', X0, 5.95, CW, 0.95, ['`v8-rules.md` — полстраницы, без кода · порядок тоже деньги: 2 формы · чтение ×1.39–1.52 · +20–28% (R=20) · 2005 rps (−13%)'], size=13, align='c', pad=0.15)

s = light('9.2', 'green', title='Тот же агент + файл правил')
todo(s, X0, Y0, 4.8, 5.6, 'LIVE №2 · генерация с v8-rules.md инлайном → литерал с null → shapes 1, MONO. Ожидание > 60 с → запись R9', 'LIVE-ДЕМО')
clone(s, 'white', X0 + 5.03, Y0, 4.8, 5.6)
big(s, X0 + 5.03, Y0 + 0.1, 4.8, 1.4, '30/30 MONO', size=44)
text(s, X0 + 5.3, 2.95, 4.26, 2.4, ['1 форма · ни одной POLY', 'p50 **0.12** (P1) / **0.38** (P2) · 0.12–0.13', '**×6.7** к 0.79 — диапазоны не пересекаются'], size=16, gap=8, align='c')
card(s, 'lime', X0 + 5.3, 5.5, 4.26, 1.1, '«отвечала за 0.79 мс — отвечает за 0.12»', size=15, align='c', pad=0.15)

s = light('9.3', 'white', title='Идиома с правилами — литерал с null')
schema(s, 11, X0, Y0, CW, 2.9, crop=(0.50, 1.0), tag='07 · схема 11, низ')
zones(s, 4.3, 0.95, ['`referrer: raw.referrer ?? null` ×3'], ['`referrer: src.referrer != null ? src.referrer : null` ×3'], size=14, gapy=0.1, labels=('A с первого слайда', 'агент + правила, 30/30'))
row(s, 'lime', ['единый литерал · ни одного if после литерала · **1 форма**'], 6.4, 0.5, size=12, align='c', pad=0.05)

s = light('9.4', 'green', title='Один агент. Разница — файл')
zones(s, Y0, 1.6, ['**2302 rps** · `out/p1-rules/candidate_1.js`'], ['**1180 rps** · `out/p1-no-rules/candidate_1.js`'], size=24, gapy=0.15, labels=('с правилами · mono-llm', 'без правил · guard-llm'))
card(s, 'blue', X0, 4.9, CW, 0.85, '«генерации, не пара с первого слайда; одна пара форм, два прибора»', size=15, align='c', pad=0.15)
row(s, 'shadow', ['оговорка: правила инлайнились явно', 'носитель: `CLAUDE.md` · cursor rules · codex'], 5.95, 0.95, size=14, align='c', pad=0.2)

# --- узел 10
divider(10)
s = light('10.1', 'grey', title='Turbolev: из чего собран и в каком статусе')
schema(s, 13, X0, Y0, CW, 4.2)
card(s, 'lime', X0, 5.65, 3.0, 1.25, ['**Maglev**', 'фронтенд · та же ставка'], size=14, align='c', pad=0.12)
clone(s, 'chev', X0 + 3.12, 5.95, 0.2, 0.6)
card(s, 'lime', X0 + 3.45, 5.65, 3.0, 1.25, ['**Turboshaft**', 'бэкенд · мимо IR TurboFan'], size=14, align='c', pad=0.12)
card(s, 'dark', X0 + 6.7, 5.65, CW - 6.7, 1.25, ['`--turbolev` = false до 15.5', 'Chrome: A/B · срок не объявлен'], size=12, color=WHITE, align='c', pad=0.12)

s = light('10.2', 'white', title='Числа Turbolev — только запись')
todo(s, X0, Y0, 5.6, 5.6, 'R10 · d8 15.2: без флага 36 мс, с --turbolev 41.6 мс; 2 секунды в кадре %PrepareFunctionForOptimization. Никогда не live', 'ЗАПИСЬ')
for i, (t, key) in enumerate((('d8 14.9 · **×2.7** позади', 'pink'), ('d8 15.2 · **41.6 vs 36 мс**', 'lime'), ('компиляция **÷2** · о качестве кода не заявлено', 'blue'), ('A/B под `--turbolev`: **0.14 / 0.95 мс, ×6.8** — как без флага (×6.6)', 'shadow'))):
    card(s, key, 6.2, Y0 + i * 1.42, 4.0, 1.3, t, size=16, pad=0.25)

s = light('10.3', 'green', title='Ставка та же')
tl = (('Crankshaft', '2010'), ('TurboFan', '2017'), ('Sparkplug', '2021'), ('Maglev', '2023'), ('Turboshaft', '2022→23'), ('Turbolev', 'за флагом'))
for i, (n_, y_) in enumerate(tl):
    card(s, 'white' if i < 5 else 'lime', X0 + i * 1.655, Y0 + 0.1, 1.55, 1.9, [f'**{y_}**', n_], size=13, align='c', pad=0.08)
clone(s, 'dark', X0, 3.6, CW, 3.3)
big(s, X0, 3.7, 3.4, 3.1, '2008', size=68, color=WHITE)
text(s, X0 + 3.5, 3.7, CW - 3.9, 3.1, ['формы и записи мест чтения', 'старше всех ступеней лестницы', 'развилка не двигается'], size=20, color=PALE, anchor='m', gap=6)

# --- узел 11
divider(11)
s = light('11.1', 'white', title='Карта целиком: две развилки, один файл')
schema(s, 1, X0, Y0, CW, 2.8)
for i, t in enumerate(('справа развилку задаёт **форма при сборке**', 'слева — **файл правил** в контексте агента', 'человек: файл — до агента · ревью — после', 'билдер: tsc / esbuild — нет замера, эксп. 4')):
    card(s, 'shadow' if i < 3 else 'blue', (X0, X0 + 5.03)[i % 2], (4.3, 5.65)[i // 2], 4.8, 1.2, t, size=15, pad=0.25)

s = light('11.2', 'grey', title='Вывод: что агент, что человек')
row(s, 'shadow', [['**0 некорректных из 60**'], ['**30/30**', 'идиоматика корпуса'], ['**перф-сознательность**', '— человек']], Y0 + 0.1, 3.3, size=19, align='c', gap=10, pad=0.2)
card(s, 'dark', X0, 5.0, CW, 1.6, 'человек: файл — до агента · ревью — после', size=20, color=WHITE, align='c')

s = light('11.3', 'green', title='Как проверить у себя')
for i, (cmd, what) in enumerate((('`node --allow-natives-syntax lab/shape-analyzer.js <файл>`', '%HaveSameMap → число форм'), ('`node --log-ic --no-logfile-per-isolate --logfile=ic.log …`', '--log-ic → MONO / MEGA'), ('`bash run-matrix.sh`', 'матрицу → на своём Node'))):
    clone(s, 'white', X0, Y0 + i * 1.55, CW, 1.4)
    text(s, X0 + 0.35, Y0 + i * 1.55, 6.0, 1.4, cmd, size=14, anchor='m')
    text(s, X0 + 6.5, Y0 + i * 1.55, 3.1, 1.4, what, size=15, anchor='m', font='X5 Sans Medium')
text(s, X0, 6.1, CW, 0.7, 'Q&A-резерв: compile hints · окно Maglev · ×27 · HOLEY · delete на d8 15.2 · две ×6.7', size=12, color=GREY, align='c', anchor='m')

# --- узел 12
divider(12)
s = light('12.1', 'white', title='Две функции, две судьбы')
zones(s, Y0, 1.05, ['`referrer: raw.referrer ?? null` · **0.12 мс**'], ['`...(raw.referrer && { referrer: raw.referrer })` · **0.79 мс**'], size=15, gapy=0.1)
schema(s, 1, X0, 3.65, CW, 2.75)
text(s, X0, 6.45, CW, 0.45, '0.12 / 0.79 — функция (shape-analyzer) · 2302 / 1180 — сервис (pipeline + autocannon) · одна пара форм 1 vs 8', size=11, color=GREY, align='c', anchor='m')

s = dark('ветка v8-holy-autumn · PITFALLS.md', 'Спасибо', ['github.com/Yoshimuro/issues-memory-research', 'Александр Зайцев'], sid='12.2')
todo(s, 10.2, 1.0, 2.4, 2.4, 'QR на ветку репо', 'QR')

s = prs.slides.add_slide(LAY['grey'])
set_title(s, 'Q&A-резерв')
drop_empty_placeholders(s)
qa = ['compile hints — не про ярусы', 'окно Maglev ~260..10 000 — гипотеза', '×27', 'HOLEY-массивы', '`delete` на d8 15.2', '«две ×6.7»', 'Sparkplug не спекулирует', 'сколько деоптов? — счётчик забракован']
for i, t in enumerate(qa):
    card(s, 'shadow', 0.47 + (i % 4) * 3.13, 1.4 + (i // 4) * 2.55, 2.98, 2.35, t, size=18, align='c', pad=0.2)
s.notes_slide.notes_text_frame.text = 'Заготовки из 06-talk-final.md: «Узел 11 → Q&A-резерв» и «Риски сцены → Сеньор в Q&A». Каждую плашку развернуть в отдельный слайд по мере готовности.'

lst = prs.slides._sldIdLst
for sldId in list(lst)[:N_TPL]:
    prs.part.drop_rel(sldId.rId)
    lst.remove(sldId)
prs.save(OUT)
print('slides:', len(prs.slides))
