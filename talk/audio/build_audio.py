#!/usr/bin/env python3
"""Озвучка talk/annotations.md: всё, что докладчик говорит, одним mp3 с главами.

  python3 build_audio.py extract   # annotations.md -> speech.json (исходный текст реплик)
  python3 build_audio.py check     # spoken.json согласован с speech.json и годится для TTS
  python3 build_audio.py build     # spoken.json -> annotations-voice.mp3 + chapters.md

spoken.json — тот же текст в произносимой форме (числа словами, латиница кириллицей,
без разметки); правила в NORMALIZE.md. Голос — ru-RU-DmitryNeural через edge-tts.
Куски кэшируются в .cache/ по хешу текста, повторная сборка озвучивает только изменённое.
"""
import asyncio, hashlib, json, os, re, subprocess, sys, difflib

HERE = os.path.dirname(os.path.abspath(__file__))
ANN = os.path.join(HERE, '..', 'annotations.md')
SPEECH, SPOKEN = os.path.join(HERE, 'speech.json'), os.path.join(HERE, 'spoken.json')
CACHE = os.path.join(HERE, '.cache')
OUT_MP3, OUT_CH = os.path.join(HERE, 'annotations-voice.mp3'), os.path.join(HERE, 'chapters.md')
VOICE, RATE = 'ru-RU-DmitryNeural', os.environ.get('TTS_RATE', '+0%')
SR = 24000                       # edge-tts отдаёт 24 кГц моно
GAP_HEAD, GAP_PARA, GAP_SLIDE, GAP_NODE, GAP_MARK = 0.7, 0.9, 1.6, 2.6, 2.0
PAUSE = '[пауза]'
STAGE = re.compile(r'\(Разделитель:[^)]*\)')   # ремарка для докладчика -> тишина
SUFFIX = {'мс', 'ми', 'го', 'й', 'х', 'м', 'ти', 'му', 'ый', 'ой', 'ом'}   # «8-ми», «1000-го», «мс» — уходят вместе с числом


def extract():
    lines = open(ANN, encoding='utf-8').read().split('\n')
    items, i = [], 0
    while i < len(lines):
        ln = lines[i]
        if ln.startswith('## Доклад в одном абзаце'):
            j = i + 1
            while not lines[j].strip(): j += 1
            items.append(dict(n=0, sid='вступление', title='Доклад в одном абзаце', kind='вступление', speech=lines[j].strip()))
        m = re.match(r'## Слайд (\d+) · (.+)$', ln)
        if m:
            parts = m.group(2).split(' · ')
            kind = parts[-1] if parts[-1] in ('разделитель', 'передышка', 'резерв') else 'слайд'
            j = i + 1
            while not lines[j].startswith('**Говорим.**'): j += 1
            buf = [lines[j][len('**Говорим.**'):].strip()]
            j += 1
            while j < len(lines) and not re.match(r'(#|---|\*\*[^*]+\.\*\*)', lines[j]):
                buf.append(lines[j].rstrip()); j += 1
            speech = re.sub(r'\n{3,}', '\n\n', '\n'.join(buf).strip())
            meta = parts[1:-1] if kind != 'слайд' else parts[1:]
            title = ' · '.join(q for q in meta if not re.fullmatch(r'[\d.]+ мин', q))
            items.append(dict(n=int(m.group(1)), sid=parts[0], title=title, kind=kind, speech=speech))
        i += 1
    json.dump(items, open(SPEECH, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{len(items)} реплик, {sum(len(x["speech"].split()) for x in items)} слов -> {SPEECH}')


def said(x):
    """То, что звучит вслух: без ремарки разделителя; у передышки — только фраза в кавычках."""
    s = STAGE.sub('', x['speech'])
    if x['kind'] == 'передышка':
        s = re.search(r'одна фраза: «(.*)»', s, re.S).group(1)
    return s


def cyr_words(s):
    return re.findall(r'[а-яё]+', s.lower().replace('ё', 'е'))


def check():
    src = {x['n']: x for x in json.load(open(SPEECH, encoding='utf-8'))}
    spk = {x['n']: x for x in json.load(open(SPOKEN, encoding='utf-8'))}
    bad = 0
    if set(src) != set(spk):
        print('разные наборы слайдов:', sorted(set(src) ^ set(spk))); bad += 1
    for n in sorted(spk):
        for f in ('title', 'speech'):
            t = spk[n][f].replace(PAUSE, '')
            left = re.findall(r'[A-Za-z0-9%×→=/*`~≈{}\[\]()_]+', t)
            if left:
                print(f'{n} {f}: не озвучить: {left}'); bad += 1
        # кириллица оригинала должна дойти до озвучки: удалять можно только окончания
        a, b = cyr_words(said(src[n])), cyr_words(spk[n]['speech'].replace(PAUSE, ''))
        for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
            if op in ('delete', 'replace'):
                gone = [w for w in a[i1:i2] if w not in SUFFIX and not any(w[:4] == v[:4] for v in b[j1:j2])]
                if gone:
                    print(f'{n}: потеряно {gone}  ->  {b[j1:j2]}'); bad += 1
    print('ok' if not bad else f'{bad} замечаний')
    return bad


NUM = 'ноль один два три четыре пять шесть семь восемь девять десять одиннадцать двенадцать тринадцать четырнадцать пятнадцать шестнадцать семнадцать восемнадцать девятнадцать'.split()
TENS = {2: 'двадцать', 3: 'тридцать', 4: 'сорок', 5: 'пятьдесят', 6: 'шестьдесят', 7: 'семьдесят', 8: 'восемьдесят', 9: 'девяносто'}
def words(n):
    return NUM[n] if n < 20 else TENS[n // 10] + ('' if n % 10 == 0 else ' ' + NUM[n % 10])


def header(x):
    if x['kind'] == 'вступление':
        return 'Вэ восемь для самых маленьких. Озвучка аннотаций доклада. Доклад в одном абзаце.'
    if x['kind'] == 'разделитель':   # sid «узел N»
        return f'Слайд {words(x["n"])}. Узел {words(int(x["sid"].split()[-1]))}. {x["title"]}.'
    return f'Слайд {words(x["n"])}. {x["title"]}.'


async def tts(text, out):
    import edge_tts
    for k in range(8):
        try:
            await edge_tts.Communicate(text, VOICE, rate=RATE).save(out + '.part')
            if os.path.getsize(out + '.part') > 1000:
                os.replace(out + '.part', out); return
        except edge_tts.exceptions.NoAudioReceived:
            pass                  # сервис изредка отвечает пустым потоком — повторяем
        await asyncio.sleep(min(2 ** k, 20))
    raise RuntimeError(f'edge-tts не озвучил: {text[:60]}…')


def pcm(mp3):
    return subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'],
                          check=True, capture_output=True).stdout


def silence(sec):
    return b'\0\0' * int(SR * sec)


def chunks(x):
    """Заголовок, затем абзацы; маркер [пауза] превращается в тишину."""
    out = [('say', header(x)), ('gap', GAP_HEAD)]
    for pi, para in enumerate(p for p in x['speech'].split('\n') if p.strip()):
        if pi: out.append(('gap', GAP_PARA))
        for si, seg in enumerate(para.split(PAUSE)):
            if si: out.append(('gap', GAP_MARK))
            if seg.strip(): out.append(('say', seg.strip()))
    return out


def build():
    if os.environ.get('TTS_CA_BUNDLE'):   # за прокси с собственным CA; проверка TLS остаётся включённой
        import certifi; certifi.where = lambda: os.environ['TTS_CA_BUNDLE']
    os.makedirs(CACHE, exist_ok=True)
    items = sorted(json.load(open(SPOKEN, encoding='utf-8')), key=lambda x: x['n'])
    plan = []
    for x in items:
        for kind, val in chunks(x):
            if kind == 'say':
                h = hashlib.sha1(f'{VOICE}|{RATE}|{val}'.encode()).hexdigest()[:16]
                plan.append((x, kind, val, os.path.join(CACHE, h + '.mp3')))
            else:
                plan.append((x, kind, val, None))
    todo = [(v, f) for _, k, v, f in plan if k == 'say' and not os.path.exists(f)]
    print(f'{len(plan)} кусков, озвучить {len(todo)}', flush=True)

    async def run():
        sem, done = asyncio.Semaphore(4), [0]
        async def one(v, f):
            async with sem:
                await tts(v, f)
                done[0] += 1
                print(f'  {done[0]}/{len(todo)}', flush=True)
        await asyncio.gather(*(one(v, f) for v, f in todo))
    asyncio.run(run())

    audio, chapters, t, prev = bytearray(), [], 0.0, None
    for x, kind, val, f in plan:
        if x is not prev:
            if prev is not None:
                g = silence(GAP_NODE if x['kind'] == 'разделитель' else GAP_SLIDE)
                audio += g
            chapters.append((len(audio) / 2 / SR, x)); prev = x
        audio += pcm(f) if kind == 'say' else silence(val)
    total = len(audio) / 2 / SR

    meta = [';FFMETADATA1', 'title=V8 для самых маленьких — озвучка аннотаций', 'artist=HolyJS 2026 Autumn · голос ' + VOICE,
            'album=V8 для самых маленьких: что за лев этот турболев?', 'genre=Speech']
    src = {s['n']: s for s in json.load(open(SPEECH, encoding='utf-8'))}
    for k, (st, x) in enumerate(chapters):
        end = chapters[k + 1][0] if k + 1 < len(chapters) else total
        name = 'Доклад в одном абзаце' if x['n'] == 0 else f'{x["n"]} · {src[x["n"]]["sid"]} · {src[x["n"]]["title"]}'
        meta += ['[CHAPTER]', 'TIMEBASE=1/1000', f'START={int(st * 1000)}', f'END={int(end * 1000)}', f'title={name}']
    mf = os.path.join(CACHE, 'meta.txt')
    open(mf, 'w', encoding='utf-8').write('\n'.join(meta) + '\n')
    raw = os.path.join(CACHE, 'all.pcm')
    open(raw, 'wb').write(audio)
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', raw, '-i', mf,
                    '-map_metadata', '1', '-map_chapters', '1', '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
                    '-ar', str(SR), '-c:a', 'libmp3lame', '-b:a', '48k', '-id3v2_version', '3', OUT_MP3], check=True)

    def ts(s):
        return f'{int(s // 3600)}:{int(s % 3600 // 60):02d}:{int(s % 60):02d}' if s >= 3600 else f'{int(s // 60)}:{int(s % 60):02d}'
    rows = ['# Озвучка аннотаций — главы', '',
            f'Файл `annotations-voice.mp3`, {ts(total)}, голос `{VOICE}` (edge-tts), темп {RATE}. '
            'Главы вшиты в mp3 (ID3 CHAP) — плееры с поддержкой глав покажут их списком.', '',
            '| Время | Слайд | Узел | Название |', '|---|---|---|---|']
    for st, x in chapters:
        s = src[x['n']]
        rows.append(f'| {ts(st)} | {x["n"] or "—"} | {s["sid"]} | {s["title"]} |')
    open(OUT_CH, 'w', encoding='utf-8').write('\n'.join(rows) + '\n')
    print(f'{OUT_MP3}: {ts(total)}, {os.path.getsize(OUT_MP3) / 1e6:.1f} МБ, {len(chapters)} глав')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'build'
    if cmd == 'extract': extract()
    elif cmd == 'check': sys.exit(1 if check() else 0)
    elif cmd == 'build': build()
    else: sys.exit(__doc__)
