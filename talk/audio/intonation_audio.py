#!/usr/bin/env python3
"""Сплошная проверка интонации озвучки: каждый кусок и каждый вопрос.

  pip install praat-parselmouth faster-whisper && python3 intonation_audio.py

1. По каждому куску — медиана тона, размах (5–95 перцентиль) и СКО в полутонах:
   монотонный кусок выделяется низким СКО на фоне остальных.
2. По каждому предложению в кусках с вопросами (границы — по словам с таймкодами Whisper):
   пик тона над медианой куска. Русский вопрос держится на тональном акценте —
   подъём на слове перед «ли» (ИК-3) или на вопросительном слове (ИК-2), —
   поэтому у вопроса пик должен быть заметно выше, чем у утверждения.
Отчёт — intonation-report.md.
"""
import hashlib, json, os, re, subprocess, sys
import numpy as np, parselmouth
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_audio import CACHE, SPOKEN, VOICE, RATE, chunks

HERE = os.path.dirname(os.path.abspath(__file__))
FLAT_Q = 4.0      # пик вопроса ниже +4 полутонов над медианой — вопрос звучит плоско


def wav16(mp3):
    out = mp3[:-4] + '.16k.wav'
    if not os.path.exists(out):
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '16000', out], check=True)
    return out


def pitch(w):
    p = parselmouth.Sound(w).to_pitch(time_step=0.01, pitch_floor=60, pitch_ceiling=300)
    f = p.selected_array['frequency']
    return p.xs(), f


def main():
    from faster_whisper import WhisperModel
    model = WhisperModel('medium', device='cpu', compute_type='int8', cpu_threads=2,
                         download_root=os.environ.get('WHISPER_DIR'))
    per_chunk, sentences = [], []
    for x in sorted(json.load(open(SPOKEN, encoding='utf-8')), key=lambda x: x['n']):
        for k, text in chunks(x):
            if k != 'say':
                continue
            f = os.path.join(CACHE, hashlib.sha1(f'{VOICE}|{RATE}|{text}'.encode()).hexdigest()[:16] + '.mp3')
            w = wav16(f)
            t, f0 = pitch(w)
            v = f0 > 0
            med = float(np.median(f0[v]))
            st = 12 * np.log2(f0[v] / med)
            per_chunk.append(dict(n=x['n'], words=len(text.split()), dur=round(float(t[-1]), 1), median_hz=round(med, 1),
                                  range_st=round(float(np.percentile(st, 95) - np.percentile(st, 5)), 2), sd_st=round(float(np.std(st)), 2)))
            if '?' not in text:
                continue
            segs, _ = model.transcribe(w, language='ru', word_timestamps=True, beam_size=5)
            cur = []
            for s in segs:
                for wd in s.words:
                    cur.append(wd)
                    if re.search(r'[.?!…]$', wd.word.strip()):
                        a, b = cur[0].start, cur[-1].end
                        m = (t >= a) & (t <= b) & (f0 > 0)
                        if m.sum() > 5:
                            s_st = 12 * np.log2(f0[m] / med)
                            sentences.append(dict(n=x['n'], q=wd.word.strip().endswith('?'), text=''.join(z.word for z in cur).strip(),
                                                  peak=round(float(np.percentile(s_st, 97)), 2), end=round(float(np.mean(s_st[-15:])), 2)))
                        cur = []
            print(x['n'], len(sentences), flush=True)
    qs = [s for s in sentences if s['q']]
    ds = [s for s in sentences if not s['q']]
    sd = np.array([c['sd_st'] for c in per_chunk])
    lo = [c for c in per_chunk if c['sd_st'] < np.median(sd) - 2 * np.std(sd)]
    flat = [s for s in qs if s['peak'] < FLAT_Q]
    with open(os.path.join(HERE, 'intonation-report.md'), 'w', encoding='utf-8') as fh:
        fh.write('# Интонация озвучки — сплошная проверка\n\n')
        fh.write(f'**Куски.** {len(per_chunk)} кусков, СКО тона {np.min(sd):.2f}–{np.max(sd):.2f} полутона, медиана {np.median(sd):.2f}; '
                 f'размах {min(c["range_st"] for c in per_chunk):.1f}–{max(c["range_st"] for c in per_chunk):.1f} полутона. '
                 f'Кусков с СКО ниже «медиана − 2σ» ({np.median(sd) - 2 * np.std(sd):.2f}): {len(lo)}'
                 + (' — ' + ', '.join(f'слайд {c["n"]} ({c["sd_st"]})' for c in lo) if lo else '') + '.\n\n')
        fh.write(f'**Вопросы.** В кусках с вопросами Whisper разметил {len(qs)} вопросительных и {len(ds)} утвердительных предложений. '
                 f'Пик тона над медианой куска: у вопросов медиана {np.median([s["peak"] for s in qs]):.1f} полутона '
                 f'(от {min(s["peak"] for s in qs):.1f} до {max(s["peak"] for s in qs):.1f}), у утверждений — {np.median([s["peak"] for s in ds]):.1f}. '
                 f'Конец предложения относительно медианы: вопросы {np.median([s["end"] for s in qs]):.1f}, утверждения {np.median([s["end"] for s in ds]):.1f}. '
                 f'Вопросов с пиком ниже +{FLAT_Q:.0f} полутонов (звучат плоско): {len(flat)}.\n\n')
        fh.write('| Слайд | Вопрос | Пик, полутоны | Конец, полутоны |\n|---|---|---|---|\n')
        for s in qs:
            fh.write(f'| {s["n"]} | {s["text"]} | {s["peak"]:+.1f} | {s["end"]:+.1f} |\n')
        fh.write('\n## Куски\n\n| Слайд | Слов | Длит., с | Медиана, Гц | Размах, полутоны | СКО, полутоны |\n|---|---|---|---|---|---|\n')
        for c in per_chunk:
            fh.write(f'| {c["n"]} | {c["words"]} | {c["dur"]} | {c["median_hz"]} | {c["range_st"]} | {c["sd_st"]} |\n')
    print(f'{len(qs)} вопросов, плоских {len(flat)}; монотонных кусков {len(lo)} -> intonation-report.md')


if __name__ == '__main__':
    main()
