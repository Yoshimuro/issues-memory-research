# -*- coding: utf-8 -*-
# Сводка: arm64 (Docker на маке) против x64 (GitHub Actions ×3) — одни и те же метрики.
import json, glob, os, re, statistics as st, sys
base = os.path.dirname(os.path.abspath(__file__)) + '/res/'
med = st.median

def jl(d, f):
    try: return [json.loads(l) for l in open(os.path.join(d, f), encoding='utf-8') if l.startswith('{')]
    except FileNotFoundError: return []

def metrics(d):
    m = {}
    refs = jl(d, 'refs.jsonl')
    a = [r['r']['p50_ms'] for r in refs if r['f'] == 'ref-a' and 'p50_ms' in r['r']]; b = [r['r']['p50_ms'] for r in refs if r['f'] == 'ref-b' and 'p50_ms' in r['r']]
    if a and b: m['прибор A, мс'] = med(a); m['прибор B, мс'] = med(b); m['прибор B/A'] = med(b) / med(a)
    c = jl(d, 'candidates.jsonl')
    nr = [x['r']['p50_ms'] for x in c if 'no-rules' in x['branch'] and 'p50_ms' in x['r']]; wr = [x['r']['p50_ms'] for x in c if 'no-rules' not in x['branch'] and 'p50_ms' in x['r']]
    if nr and wr:
        m['генерации без правил, мс'] = med(nr); m['генерации с правилами, мс'] = med(wr); m['генерации без/с'] = med(nr) / med(wr)
        m['MEGA без правил (из 30)'] = sum(1 for x in c if 'no-rules' in x['branch'] and x['r'].get('ic') == 'MEGA')
        m['MONO с правилами (из 30)'] = sum(1 for x in c if 'no-rules' not in x['branch'] and x['r'].get('ic') == 'MONO')
        m['некорректных (из 60)'] = sum(1 for x in c if not x['r'].get('correct'))
    t = jl(d, 'tiers.jsonl'); tm = {n: med([r['r']['ms'] for r in t if r['maxopt'] == n and 'ms' in r.get('r', {})] or [float('nan')]) for n in range(4)}
    for n, nm in enumerate(('Ignition', 'Sparkplug', 'Maglev', 'TurboFan')): m[f'лестница {nm}, мс'] = tm[n]
    m['лестница Ignition/TurboFan'] = tm[0] / tm[3]; m['лестница Sparkplug/Ignition'] = tm[1] / tm[0]
    th = []
    try:
        for l in open(os.path.join(d, 'tier-threshold.jsonl'), encoding='utf-8'):
            g = re.match(r'^\{.*?\}', l)
            if g: th.append(json.loads(g.group(0)))
    except FileNotFoundError: pass
    for k, nm in (('baseline', 'Sparkplug'), ('maglev', 'Maglev'), ('turbofan', 'TurboFan')):
        v = [x[k] for x in th if k in x]
        if v: m[f'ярус {nm}, вызов'] = med(v)
    tl = jl(d, 'turbolev.jsonl'); ta = [r['r']['p50_ms'] for r in tl if r['f'] == 'ref-a' and 'p50_ms' in r['r']]; tb = [r['r']['p50_ms'] for r in tl if r['f'] == 'ref-b' and 'p50_ms' in r['r']]
    if ta and tb: m['turbolev B/A'] = med(tb) / med(ta)
    wm = open(os.path.join(d, 'wrongmap.txt'), encoding='utf-8').read().split('\n') if os.path.exists(os.path.join(d, 'wrongmap.txt')) else []
    m['wrong map: score у B (из 5)'] = sum(1 for l in wm if l.startswith('ref-b score')); m['wrong map: score у A (из 5)'] = sum(1 for l in wm if l.startswith('ref-a score'))
    p = jl(d, 'pipeline.jsonl')
    def g(v, b, r, k):
        xs = [c[k] for c in p if c['variant'] == v and c['batch'] == b and c['r'] == r]; return med(xs) if xs else float('nan')
    for r in (1, 5, 20):
        m[f'пайплайн R={r}, guard/mono'] = med([g('guard-llm', b, r, 'p50_total') / g('mono-llm', b, r, 'p50_total') for b in (500, 5000)])
    m['normalize if-guard'] = med([g('guard-llm', b, r, 'normalize_ms') / g('mono-llm', b, r, 'normalize_ms') for b in (500, 5000) for r in (1, 5, 20)])
    m['normalize спред (ref-b)'] = med([g('ref-b', b, r, 'normalize_ms') / g('ref-a', b, r, 'normalize_ms') for b in (500, 5000) for r in (1, 5, 20)])
    m['consume guard/mono'] = med([g('guard-llm', b, r, 'consume_ms') / g('mono-llm', b, r, 'consume_ms') for b in (500, 5000) for r in (1, 5, 20)])
    m['serialize guard/mono'] = med([g('guard-llm', b, r, 'serialize_ms') / g('mono-llm', b, r, 'serialize_ms') for b in (500, 5000) for r in (1, 5, 20)])
    m['consume mixed/mono'] = med([g('mixed-mono', b, r, 'consume_ms') / g('mono-llm', b, r, 'consume_ms') for b in (500, 5000) for r in (1, 5, 20)])
    m['доля parse A, R=1, %'] = 100 * g('mono-llm', 500, 1, 'parse_ms') / g('mono-llm', 500, 1, 'p50_total')
    m['доля parse B, R=20, %'] = 100 * g('guard-llm', 500, 20, 'parse_ms') / g('guard-llm', 500, 20, 'p50_total')
    nor = lambda v, b: sum(g(v, b, 1, k) for k in ('parse_ms', 'normalize_ms', 'serialize_ms'))
    m['без чтения, if-guard, %'] = med([100 * (nor('guard-llm', b) / nor('mono-llm', b) - 1) for b in (500, 5000)])
    m['без чтения, спред, %'] = med([100 * (nor('ref-b', b) / nor('ref-a', b) - 1) for b in (500, 5000)])
    h = {x['variant']: x for x in jl(d, 'http.jsonl')}
    if 'mono-llm' in h and 'guard-llm' in h:
        m['HTTP mono, rps'] = h['mono-llm']['rps_avg']; m['HTTP guard, rps'] = h['guard-llm']['rps_avg']; m['HTTP mono/guard'] = h['mono-llm']['rps_avg'] / h['guard-llm']['rps_avg']
        m['HTTP p99 mono, мс'] = h['mono-llm']['lat_p99_ms']; m['HTTP p99 guard, мс'] = h['guard-llm']['lat_p99_ms']
        if 'mixed-mono' in h: m['HTTP mixed к mono, %'] = 100 * (h['mixed-mono']['rps_avg'] / h['mono-llm']['rps_avg'] - 1)
    my = {}
    for r in jl(d, 'myths-raw.jsonl'):
        x = r.get('data', {})
        if x.get('ms') is not None: my.setdefault(f"{x['bench']}/{x['case']}", []).append(x['ms'])
    mm = lambda k: med(my[k]) if k in my else float('nan')
    m['IC 8/1'] = mm('ic/8-shapes') / mm('ic/1-shapes'); m['IC 4/1'] = mm('ic/4-shapes') / mm('ic/1-shapes')
    m['IC 8-shapes разброс, мс'] = (min(my.get('ic/8-shapes', [0])), max(my.get('ic/8-shapes', [0])))
    m['delete/fast'] = mm('delete/delete') / mm('delete/fast'); m['try/catch наивный'] = mm('trycatch/naive-try') / mm('trycatch/naive-plain')
    m['try/catch изолир. try/plain'] = mm('trycatch/honest-try') / mm('trycatch/honest-plain'); m['HOLEY/SMI'] = mm('elements/HOLEY') / mm('elements/SMI')
    return m

def fmt(v):
    if isinstance(v, tuple): return f'{v[0]}–{v[1]}'
    if isinstance(v, float): return '—' if v != v else (f'{v:.2f}' if abs(v) < 100 else f'{v:.0f}')
    return str(v)

out = []
for node in ('24', '22'):
    arm = metrics(base + f'arm-node{node}')
    gdirs = sorted(glob.glob(base + f'gha/*/numbers-node{node}-run*'))
    xs = [metrics(d) for d in gdirs]
    out.append(f'\n## Node {node}: arm64 (Docker, мак) против x64 (GitHub Actions, {len(xs)} прогона)\n')
    out.append('| метрика | arm64 | x64 медиана | x64 по прогонам |\n|---|---|---|---|')
    for k in arm:
        vals = [x.get(k) for x in xs if x.get(k) is not None]
        if vals and not isinstance(vals[0], tuple):
            nums = [v for v in vals if v == v]
            xm = fmt(med(nums)) if nums else '—'
        else: xm = ''
        out.append(f'| {k} | {fmt(arm[k])} | {xm} | {" · ".join(fmt(v) for v in vals)} |')
    cpu = [open(os.path.join(d, 'env.txt')).read().split('\n')[0] for d in gdirs[:1]]
    out.append(f'\nx64: {cpu[0] if cpu else ""}')
txt = '\n'.join(out); open(base + 'COMPARE.md', 'w', encoding='utf-8').write(txt); print(txt)
