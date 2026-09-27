#!/usr/bin/env python3
"""Проверка озвучки обратным распознаванием: каждый кусок из .cache/ гоняется через Whisper.

  pip install faster-whisper && python3 qa_audio.py [модель]   # по умолчанию medium

Две проверки на слайд:
  • числа — все числа исходного текста (speech.json) должны найтись в распознанном
    (Whisper пишет числа цифрами), так ловятся ошибки и в нормализации, и в произношении;
  • WER по кириллице — расхождение распознанного с произносимым текстом (spoken.json);
    термины Whisper часто пишет латиницей (Турбофан -> TurboFan), поэтому порог мягкий.
Отчёт — qa-report.md.
"""
import collections, hashlib, json, os, re, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_audio import CACHE, SPEECH, SPOKEN, VOICE, RATE, STAGE, chunks, said
from faster_whisper import WhisperModel

HERE = os.path.dirname(os.path.abspath(__file__))
LAT = {'turbofan': 'турбофан', 'maglev': 'маглев', 'sparkplug': 'спаркплаг', 'ignition': 'игнишн', 'node': 'нода',
       'v8': 'вэ восемь', 'turbolev': 'турболев', 'turboshaft': 'турбошафт', 'null': 'налл', 'map': 'мэп'}


def nums(s):
    s = STAGE.sub('', s)
    s = re.sub(r'(?<=\d)[  ](?=\d{3}\b)', '', s)          # 13 000 -> 13000
    # версии звучат по частям: «Node 24.21.0» -> 24 21 0, «V8 13.6» -> 13 6
    s = re.sub(r'\b(V8|Node|node|Chrome) (\d+(?:\.\d+)+)', lambda m: m.group(1) + ' ' + m.group(2).replace('.', ' '), s)
    s = re.sub(r'\b\d+\.\d+\.\d+\b', lambda m: m.group(0).replace('.', ' '), s)
    out = []
    for m in re.findall(r'\d+(?:[.,]\d+)?', s):
        m = m.replace(',', '.')
        out.append(m.rstrip('0').rstrip('.') if '.' in m else m)   # 0.80 == 0,8
    return out


def words(s):
    s = s.lower().replace('ё', 'е')
    for k, v in LAT.items(): s = re.sub(rf'\b{k}\b', v, s)
    return re.findall(r'[а-я]+', s)


def wer(r, h):
    d = list(range(len(h) + 1))
    for i in range(1, len(r) + 1):
        prev, d[0] = d[0], i
        for j in range(1, len(h) + 1):
            cur = min(d[j] + 1, d[j - 1] + 1, prev + (r[i - 1] != h[j - 1])); prev, d[j] = d[j], cur
    return d[len(h)] / max(1, len(r))


def main():
    name = sys.argv[1] if len(sys.argv) > 1 else 'medium'
    model = WhisperModel(name, device='cpu', compute_type='int8', download_root=os.environ.get('WHISPER_DIR'))
    src = {x['n']: x for x in json.load(open(SPEECH, encoding='utf-8'))}
    rows, bad = [], 0
    for x in sorted(json.load(open(SPOKEN, encoding='utf-8')), key=lambda x: x['n']):
        said_txt = [v for k, v in chunks(x) if k == 'say']
        hyp = []
        for t in said_txt:
            f = os.path.join(CACHE, hashlib.sha1(f'{VOICE}|{RATE}|{t}'.encode()).hexdigest()[:16] + '.mp3')
            txt = f[:-4] + f'.{name}.txt'      # расшифровка кэшируется рядом с куском
            if not os.path.exists(txt):
                while not os.path.exists(f):   # можно запускать параллельно со сборкой
                    time.sleep(5)
                segs, _ = model.transcribe(f, language='ru', beam_size=5, vad_filter=False)
                open(txt, 'w', encoding='utf-8').write(' '.join(s.text.strip() for s in segs))
            hyp.append(open(txt, encoding='utf-8').read())
        hyp = ' '.join(hyp)
        want = collections.Counter(nums(said(src[x['n']])) + nums(src[x['n']]['title']))
        got = collections.Counter(nums(hyp))
        missing = sorted((want - got).elements(), key=lambda v: float(v))
        w = wer(words(' '.join(said_txt)), words(hyp))
        flag = bool(missing) or w > 0.2
        bad += flag
        rows.append((x['n'], src[x['n']]['sid'], round(w, 3), missing, hyp if flag else ''))
        print(x['n'], round(w, 3), missing, flush=True)
    with open(os.path.join(HERE, 'qa-report.md'), 'w', encoding='utf-8') as f:
        f.write('# Проверка озвучки обратным распознаванием\n\n'
                f'Whisper `{name}` по каждому куску. «Нет в распознанном» — числа из '
                'исходного текста, которых Whisper не услышал; WER — по кириллице против произносимого текста.\n\n'
                '| Слайд | Узел | WER | Нет в распознанном |\n|---|---|---|---|\n')
        for n, sid, w, miss, _ in rows:
            f.write(f'| {n} | {sid} | {w:.3f} | {", ".join(miss) or "—"} |\n')
        f.write(f'\nСредний WER: {sum(r[2] for r in rows) / len(rows):.3f}. Слайдов с замечаниями: {bad}.\n')
        flagged = [r for r in rows if r[4]]
        if flagged:
            f.write('\n## Распознанный текст слайдов с замечаниями\n')
            for n, sid, w, miss, hyp in flagged:
                f.write(f'\n**{n} · {sid}** (WER {w:.3f}; нет: {", ".join(miss) or "—"})\n\n> {hyp}\n')
    print(f'{bad} слайдов с замечаниями -> qa-report.md')


if __name__ == '__main__':
    main()
