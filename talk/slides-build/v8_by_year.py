# -*- coding: utf-8 -*-
# Схемы V8 по годам (2014 / 2022 / 2027-прогноз) в стиле колоды: 4 подробных слайда для статьи + 3 кадра для доклада (нарастанием).
#   python v8_by_year.py /tmp/v8-by-year.pptx   # pptx с нативными фигурами — копировать слайды в колоду; в git только PNG (talk/v8-by-year/)
# Факты сверены по исходникам V8 на тегах, блогу v8.dev и changelog Node (сентябрь 2026); 2027 — прогноз по состоянию main.
# Сетка общая для всех лет: одна роль — одна колонка, поэтому видно, что появилось и что ушло.
import sys, os
from lxml import etree
HERE = os.path.dirname(os.path.abspath(__file__))
_b2 = open(os.path.join(HERE, 'build2.py'), encoding='utf-8').read().split('\n# ================= СЛАЙДЫ')[0]
exec(_b2)
exec(open(os.path.join(HERE, 'lib3.py'), encoding='utf-8').read())

X0, X1 = 0.37, 12.96                      # поля шаблона X5; логотип внизу слева — ниже y 6.5
GAP = 0.36
CW = (X1 - X0 - 4 * GAP) / 5
COLX = [X0 + i * (CW + GAP) for i in range(5)]
ROLES = ['разбор', 'первый код', 'базовый JIT', 'оптимизатор: средний', 'оптимизатор: верхний']
BAND_Y, BAND_H = 1.2, 0.44                 # записи мест чтения — над ярусами
BY, BH = 1.98, 2.45                        # ряд ярусов
DY = 4.8                                   # путь деопта — под ярусами
SOFT, OPT, NONE = 'F1F3F5', PALE, 'FFFFFF'


def tier(s, col, name, lines, kind='soft', y=BY, h=BH, tag=None, foot=None, role=True):
    """kind: soft — без ставки, opt — со ставкой на формы, none — яруса нет, flag — в коде за флагом, forecast — прогноз."""
    x = COLX[col]
    fill = dict(soft=SOFT, opt=OPT, none=NONE, flag=NONE, forecast=NONE)[kind]
    line = dict(soft=None, opt=None, none=FAINT, flag=MUTED, forecast=GREEN)[kind]
    color = MUTED if kind in ('none', 'flag') else GREEN
    rect(s, x, y, CW, h, fill, line=line, lw=1.75, dash=kind in ('none', 'flag', 'forecast'), radius=0.1)
    top = y + 0.1
    if tag:
        tw = 0.1 * len(tag) + 0.3
        rect(s, x + 0.16, top, tw, 0.27, LIME, radius=0.06)
        text(s, x + 0.16, top, tw, 0.27, tag, size=11, color=GREEN, align='c', anchor='m', font='X5 Sans Medium'); top += 0.32
    elif role:
        text(s, x + 0.16, top, CW - 0.32, 0.25, ROLES[col], size=11, color=MUTED); top += 0.26
    text(s, x + 0.16, top, CW - 0.32, 0.4, f'**{name}**', size=19, color=color)
    text(s, x + 0.16, top + 0.43, CW - 0.32, h - (top - y) - 0.5, lines, size=13 if h > 1.5 else 12, color=color, gap=2)
    if foot:
        seg(s, x + 0.16, y + h - 0.42, x + CW - 0.16, y + h - 0.42, MUTED, 0.75, dash=True)
        text(s, x + 0.16, y + h - 0.38, CW - 0.32, 0.32, foot, size=11, color=MUTED, anchor='m')


def header(year, title, versions, gist):
    s_ = prs.slides.add_slide(LAY['white'])
    set_title(s_, title)
    tt = s_.shapes.title
    tt.left, tt.top, tt.width, tt.height = Inches(0.37), Inches(0.40), Inches(11.0), Inches(0.58)
    drop_empty_placeholders(s_)
    text(s_, 11.4, 0.42, 1.55, 0.3, f'V8 · {year}', size=11, color=MUTED, align='r')
    text(s_, X0, 5.52, X1 - X0, 0.6, gist, size=14, color=GREEN)
    text(s_, X0, 6.12, X1 - X0, 0.3, versions, size=12, color=MUTED, align='r')
    return s_


def flow(s, c1, c2, label=None, y=None):
    """Подъём на ярус выше. Отсутствующие ярусы нарисованы ниже стрелки, поэтому она идёт над ними;
    подпись — только у стрелки через пропущенные колонки (в узком зазоре ей места нет)."""
    y = y or BY + 0.62
    x1, x2 = COLX[c1] + CW, COLX[c2]
    arrow(s, x1 + 0.02, y, x2 - 0.04, y)
    if label and c2 - c1 > 1:
        text(s, COLX[c1 + 1], y + 0.04, x2 - GAP - COLX[c1 + 1], 0.28, label, size=11, color=MUTED, align='c')


def absent(s, col, name, lines, kind='none', foot=None):
    """Ярус, которого в этом году нет (или он только за флагом): коробка ниже линии подъёма."""
    tier(s, col, name, lines, kind=kind, y=BY + 0.95, h=BH - 0.95, foot=foot, role=False)
    text(s, COLX[col] + 0.16, BY + 0.1, CW - 0.32, 0.25, ROLES[col], size=11, color=MUTED)


def ic_band(s, cols_write, cols_bet, label):
    """Записи мест чтения: неоптимизирующие ярусы пишут, оптимизирующие ставят по ним."""
    x0, x1 = COLX[1], COLX[4] + CW
    rect(s, x0, BAND_Y, x1 - x0, BAND_H, 'FFFFFF', line=GREEN, lw=1.5, radius=0.08)
    text(s, x0 + 0.2, BAND_Y, x1 - x0 - 0.4, BAND_H, label, size=13, color=GREEN, anchor='m')
    for c in cols_write:
        cx = COLX[c] + CW * 0.5
        arrow(s, cx, BY - 0.02, cx, BAND_Y + BAND_H + 0.03, GREEN, 1.5)
        text(s, cx + 0.08, BAND_Y + BAND_H + 0.02, 1.0, 0.28, 'пишет', size=11, color=MUTED, anchor='m')
    for c in cols_bet:
        cx = COLX[c] + CW * 0.5
        arrow(s, cx, BAND_Y + BAND_H + 0.02, cx, BY - 0.03, GREEN, 1.5)
        text(s, cx + 0.08, BAND_Y + BAND_H + 0.02, 1.0, 0.28, 'ставка', size=11, color=MUTED, anchor='m')


def deopt(s, cols_from, col_to, label, sub=None):
    """Промах ставки: оптимизированный код → вниз, в неоптимизирующий ярус."""
    tx = COLX[col_to] + CW * 0.5
    far = max(COLX[c] + CW * 0.5 for c in cols_from)
    for c in cols_from:
        fx = COLX[c] + CW * 0.5
        seg(s, fx, BY + BH, fx, DY, BRED, 2.25)
    seg(s, far, DY, tx, DY, BRED, 2.25)
    arrow(s, tx, DY, tx, BY + BH + 0.04, BRED, 2.25)
    text(s, tx + 0.15, DY + 0.05, far - tx - 0.3, 0.3, label, size=13, color=BRED, align='c')
    if sub:
        text(s, tx + 0.15, DY + 0.34, far - tx - 0.3, 0.3, sub, size=11.5, color=MUTED, align='c')


# ======================= 2014 =======================
s = header(2014, 'V8 в 2014: full-codegen и Crankshaft',
           'стабильный Chrome 32–39 · V8 3.22–3.29 · Node 0.10 (V8 3.14) · Node 0.12 — февраль 2015',
           '**Байткода нет:** первый код функции — сразу машинный. Две ступени: неоптимизированный код с IC → Crankshaft со ставкой на формы.')
tier(s, 0, 'Parser', ['ленивый разбор', 'тело — при первом вызове', '→ AST'])
tier(s, 1, 'full-codegen', ['AST сразу в машинный код', 'IC — заглушки в коде', 'с 2010'])
absent(s, 2, 'нет', ['full-codegen и есть базовый ярус'])
absent(s, 3, 'нет', ['среднего яруса нет'])
tier(s, 4, 'Crankshaft', ['Hydrogen → Lithium', 'в фоне (Chrome 30+)', 'заново разбирает исходник'], kind='opt',
     foot='TurboFan: есть, выключен')
flow(s, 0, 1, 'первый вызов')
flow(s, 1, 4, 'горячая по счётчику')
ic_band(s, [1], [4], '**Inline caches** — заглушки в коде full-codegen: 1–4 формы, пятая — мега')
deopt(s, [4], 1, 'деопт: не та форма → обратно в код full-codegen')

# ======================= 2022 =======================
s = header(2022, 'V8 в 2022: Ignition, Sparkplug, TurboFan',
           'стабильный Chrome 97–108 · V8 9.7–10.8 · Node 16 (V8 9.4), Node 18 (V8 10.1–10.2) · в Node 12/14 Sparkplug нет',
           '**Байткод вместо машинного кода на старте** (с 2017); full-codegen и Crankshaft удалены. В 2021 между ними встал Sparkplug.')
tier(s, 0, 'Parser', ['ленивый разбор', 'тело — при первом вызове', '→ AST'])
tier(s, 1, 'Ignition', ['байткод + интерпретатор', 'с Chrome 59 (2017)'])
tier(s, 2, 'Sparkplug', ['байткод → машинный код', 'за один проход', 'с Chrome 91–94 (2021)'])
absent(s, 3, 'Maglev', ['за флагом --maglev', 'по умолчанию — 2023'], kind='flag')
tier(s, 4, 'TurboFan', ['граф Sea of Nodes', 'компиляция в фоне', 'с Chrome 59 (2017)'], kind='opt',
     foot='Turboshaft: за флагом')
flow(s, 0, 1, 'байткод')
flow(s, 1, 2, 'первый тик')
flow(s, 2, 4, 'горячая, записи стабильны')
ic_band(s, [1, 2], [4], '**Записи мест чтения** — слоты FeedbackVector: 1–4 формы, пятая — мега')
deopt(s, [4], 2, 'деопт: не та форма → в код Sparkplug', sub='если кода Sparkplug нет — в Ignition')

# ======================= 2027 =======================
s = header(2027, 'V8 в 2027: Maglev и Turbolev (прогноз)',
           'прогноз · Chrome ≈160–184 · V8 ≈16–18 · Node 26 LTS (V8 14.6, TurboFan) · Node 27 — апрель 2027',
           '**Четыре яруса, два оптимизирующих.** Turbolev = граф Maglev + бэкенд Turboshaft вместо TurboFan: в Chrome, вероятно, в 2027, дата не объявлена. Node 26 весь год на TurboFan.')
tier(s, 0, 'Parser', ['ленивый разбор', '+ подсказки компиляции', '(Chrome 136)'])
tier(s, 1, 'Ignition', ['байткод + интерпретатор'])
tier(s, 2, 'Sparkplug', ['байткод → машинный код', 'Sparkplug+: патчит', 'по записям (Chrome 154+)'])
tier(s, 3, 'Maglev', ['быстрый, со ставкой', 'по умолчанию с 2023', 'в Node 24+'], kind='opt')
h2 = (BH - 0.1) / 2
tier(s, 4, 'TurboFan', ['Sea of Nodes → Turboshaft'], kind='opt', h=h2)
tier(s, 4, 'Turbolev', ['Maglev → Turboshaft'], kind='forecast', y=BY + h2 + 0.1, h=h2, tag='прогноз')
flow(s, 0, 1, 'байткод')
flow(s, 1, 2, 'первый тик')
flow(s, 2, 3, 'горячая')
flow(s, 3, 4, 'ещё горячее')
ic_band(s, [1, 2], [3, 4], '**Записи мест чтения** — FeedbackVector · 5+ форм без мега (Homomorphic IC) — прогноз, Chrome 156')
deopt(s, [3, 4], 1, 'деопт: не та форма → кадр доигрывает в Ignition', sub='следующие вызовы — снова в код Sparkplug')

# ======================= сводка =======================
s = prs.slides.add_slide(LAY['white'])
set_title(s, 'Ярусы V8: что поменялось с 2014 года')
tt = s.shapes.title
tt.left, tt.top, tt.width, tt.height = Inches(0.37), Inches(0.40), Inches(11.0), Inches(0.58)
drop_empty_placeholders(s)
text(s, 11.4, 0.42, 1.55, 0.3, 'V8 · сводка', size=11, color=MUTED, align='r')
LX = X0 + 0.95
cw = (X1 - LX - 3 * GAP) / 4
cx = [LX + i * (cw + GAP) for i in range(4)]
for i, r in enumerate(ROLES[1:]):
    text(s, cx[i], 1.3, cw, 0.3, r, size=12, color=MUTED)
ROWS = [('2014', [('full-codegen', 'soft'), ('нет', 'none'), ('нет', 'none'), ('Crankshaft', 'opt')], 'деопт → full-codegen'),
        ('2022', [('Ignition', 'soft'), ('Sparkplug', 'soft'), ('Maglev: за флагом', 'flag'), ('TurboFan', 'opt')], 'деопт → Sparkplug, если есть его код, иначе Ignition'),
        ('2027', [('Ignition', 'soft'), ('Sparkplug', 'soft'), ('Maglev', 'opt'), ('TurboFan → Turbolev?', 'forecast')], 'деопт → Ignition · Turbolev — прогноз')]
RH = 0.8
for r, (yr, cells, dn) in enumerate(ROWS):
    y = 1.72 + r * 1.3
    ay = y + 0.24                                   # линия подъёма
    text(s, X0, y, 0.9, RH, f'**{yr}**', size=22, anchor='m')
    path = [i for i, (_, k) in enumerate(cells) if k not in ('none', 'flag')]
    for i, (nm, kind) in enumerate(cells):
        if kind in ('none', 'flag'):                # яруса нет — плашка ниже линии подъёма
            rect(s, cx[i], y + 0.44, cw, RH - 0.44, 'FFFFFF', line=MUTED if kind == 'flag' else FAINT, lw=1.25, dash=True, radius=0.08)
            text(s, cx[i], y + 0.44, cw, RH - 0.44, nm, size=12.5, color=MUTED, align='c', anchor='m')
            continue
        fill = OPT if kind == 'opt' else (SOFT if kind == 'soft' else 'FFFFFF')
        rect(s, cx[i], y, cw, RH, fill, line=GREEN if kind == 'forecast' else None, lw=1.5, dash=kind == 'forecast', radius=0.1)
        text(s, cx[i] + 0.1, y, cw - 0.2, RH, f'**{nm}**', size=17 if len(nm) < 16 else 15, color=GREEN, align='c', anchor='m')
    for i, j in zip(path, path[1:]):
        arrow(s, cx[i] + cw + 0.02, ay, cx[j] - 0.03, ay, GREEN, 1.5)
    text(s, cx[0], y + RH + 0.05, cx[3] + cw - cx[0], 0.3, dn, size=12, color=BRED, align='r')
clone(s, 'dark', X0, 5.55, X1 - X0, 0.85)
text(s, X0 + 0.3, 5.55, X1 - X0 - 0.6, 0.85, ['**Не менялось с 2008:** формы объектов (maps) и записи мест чтения (IC) · промах ставки — деопт вниз · оптимизация в фоне'],
     size=15, color=WHITE, anchor='m')

# ======================= для доклада: три кадра нарастанием (те же, что в колоде: 7.2, 8.3, 10.2) =======================
TITLES = ('2014: full-codegen и Crankshaft', '2022: байткод, Sparkplug, TurboFan', '2027: Maglev и Turbolev')
for k in range(3):
    s = prs.slides.add_slide(LAY['white'])
    set_title(s, TITLES[k])
    tt = s.shapes.title
    tt.left, tt.top, tt.width, tt.height = Inches(0.37), Inches(0.40), Inches(11.0), Inches(0.58)
    drop_empty_placeholders(s)
    text(s, 11.4, 0.42, 1.55, 0.3, f'V8 · {k + 1} из 3', size=11, color=MUTED, align='r')
    schema_eras(s, k)

# ---------- выкинуть слайды шаблона, сохранить
lst = prs.slides._sldIdLst
for sldId in list(lst)[:N_TPL]:
    prs.part.drop_rel(sldId.rId); lst.remove(sldId)
prs.save(OUT)
print('slides:', len(prs.slides), '->', OUT)
