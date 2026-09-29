// Сводка одного прогона verify.sh → NUMBERS.md. Запуск: node docker/report.js docker/out/alpine-node24
'use strict';
const fs = require('fs'), path = require('path');
const dir = process.argv[2];
const rd = f => { try { return fs.readFileSync(path.join(dir, f), 'utf8'); } catch { return ''; } };
const jl = f => rd(f).split('\n').filter(l => l.startsWith('{')).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? (s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2) : NaN; };
const rng = a => a.length ? `${Math.min(...a)}–${Math.max(...a)}` : '—';
const x = (a, b, d = 2) => '×' + (a / b).toFixed(d);
const out = [];
const P = s => out.push(s);

P(`# Числа прогона ${path.basename(dir)}\n`);
P('```\n' + rd('env.txt').trim() + '\n```\n');

// прибор
const refs = jl('refs.jsonl'), ra = refs.filter(r => r.f === 'ref-a').map(r => r.r.p50_ms), rb = refs.filter(r => r.f === 'ref-b').map(r => r.r.p50_ms);
P('## Прибор (shape-analyzer), p50 прохода чтения, мс');
P(`- A: **${med(ra)}** (${rng(ra)}) · B: **${med(rb)}** (${rng(rb)}) · **${x(med(rb), med(ra), 1)}** · формы ${refs.find(r => r.f === 'ref-a')?.r.shapes} / ${refs.find(r => r.f === 'ref-b')?.r.shapes}`);
P('- live №1: `' + rd('samemap.txt').trim().replace(/\n/g, ' · ') + '`');
P('- статус читателя: `' + rd('reader-status.txt').trim().replace(/\n/g, ' | ') + '`\n');

// генерации
P('## Генерации агента');
const cand = jl('candidates.jsonl'), br = {};
for (const c of cand) (br[c.branch] ||= []).push(c.r);
for (const [b, rs] of Object.entries(br)) {
  const ok = rs.filter(r => !r.error), ic = {}; ok.forEach(r => ic[r.ic] = (ic[r.ic] || 0) + 1);
  P(`- ${b}: n=${rs.length} · битых ${rs.length - ok.length} · некорректных ${ok.filter(r => !r.correct).length} · ${JSON.stringify(ic)} · форм ${[...new Set(ok.map(r => r.shapes))]} · p50 **${med(ok.map(r => r.p50_ms))}** (${rng(ok.map(r => r.p50_ms))})`);
}
const nr = cand.filter(c => /no-rules/.test(c.branch) && !c.r.error).map(c => c.r.p50_ms), wr = cand.filter(c => /-rules/.test(c.branch) && !/no-rules/.test(c.branch) && !c.r.error).map(c => c.r.p50_ms);
P(`- без правил / с правилами: **${x(med(nr), med(wr), 1)}**\n`);
const ctl = jl('candidates-control.jsonl'); if (ctl.length) P(`- контроль ref-b до/после серии: ${ctl.map(c => c.r.p50_ms).join(' · ')}` + (fs.existsSync(path.join(dir, 'candidates-disturbed.jsonl')) ? ' · первая серия забракована (помеха на старте прогона), сохранена в candidates-disturbed.jsonl' : '') + '\n');

// лестница и пороги
P('## Лестница ярусов (tier-bench, одна функция), мс');
const tiers = jl('tiers.jsonl'), t = n => tiers.filter(r => r.maxopt === n && r.r && r.r.ms).map(r => r.r.ms);
P(`- Ignition **${med(t(0))}** → Sparkplug **${med(t(1))}** → Maglev **${med(t(2))}** → TurboFan **${med(t(3))}** · Ignition/TurboFan **${x(med(t(0)), med(t(3)), 1)}**`);
const th = rd('tier-threshold.jsonl').split('\n').map(l => { const m = l.match(/^\{.*?\}/); try { return m ? JSON.parse(m[0]) : null; } catch { return null; } }).filter(Boolean);
P(`- на каком вызове ярус (5 прогонов): Sparkplug ${rng(th.map(r => r.baseline).filter(Boolean))} · Maglev ${th.some(r => r.maglev) ? rng(th.map(r => r.maglev).filter(Boolean)) : '—'} · TurboFan ${th.some(r => r.turbofan) ? rng(th.map(r => r.turbofan).filter(Boolean)) : '—'}\n`);

// turbolev
const tl = jl('turbolev.jsonl'), ta = tl.filter(r => r.f === 'ref-a' && r.r.p50_ms).map(r => r.r.p50_ms), tb = tl.filter(r => r.f === 'ref-b' && r.r.p50_ms).map(r => r.r.p50_ms);
P('## A/B под --turbolev');
P(ta.length ? `- A **${med(ta)}** · B **${med(tb)}** · **${x(med(tb), med(ta), 1)}**\n` : '- флага в этой версии V8 нет\n');

// wrong map
P('## wrong map (5 прогонов demo-wrongmap + прибор)');
const wm = {}; rd('wrongmap.txt').split('\n').filter(Boolean).forEach(l => wm[l] = (wm[l] || 0) + 1);
Object.entries(wm).sort().forEach(([k, v]) => P(`- ${k}: ${v}`)); P('');

// log-ic
P('## --log-ic: читатель score, поле plan (old→new)');
for (const f of ['ref-a', 'ref-b']) {
  const tr = rd(`ic-${f}.log`).split('\n').filter(l => l.startsWith('LoadIC,')).map(l => l.split(',')).filter(c => +c[3] >= 29 && +c[3] <= 35 && c[8] === 'plan').map(c => `${c[5]}→${c[6]}`);
  P(`- ${f}: ${tr.join(' · ') || '—'}`);
}
P('');

// пайплайн
P('## Пайплайн (медианы 5 повторов), B относительно A');
const pl = jl('pipeline.jsonl'), g = (v, b, r, k) => med(pl.filter(c => c.variant === v && c.batch === b && c.r === r).map(c => c[k]));
const sinks = {}; pl.forEach(c => (sinks[c.batch + '/' + c.r] ||= new Set()).add(c.semanticSink));
P(`- ячеек ${pl.length} · чексумма совпала во всех: ${Object.values(sinks).every(s => s.size === 1)}`);
for (const [a, b] of [['mono-llm', 'guard-llm'], ['ref-a', 'ref-b'], ['mono-llm', 'mixed-mono']]) {
  P(`\n### ${b} / ${a}\n| batch | R | total | normalize | consume | serialize | доля parse A → B |\n|---|---|---|---|---|---|---|`);
  for (const bt of [500, 5000]) for (const r of [1, 5, 20])
    P(`| ${bt} | ${r} | ${x(g(b, bt, r, 'p50_total'), g(a, bt, r, 'p50_total'))} | ${x(g(b, bt, r, 'normalize_ms'), g(a, bt, r, 'normalize_ms'))} | ${x(g(b, bt, r, 'consume_ms'), g(a, bt, r, 'consume_ms'))} | ${x(g(b, bt, r, 'serialize_ms'), g(a, bt, r, 'serialize_ms'))} | ${(100 * g(a, bt, r, 'parse_ms') / g(a, bt, r, 'p50_total')).toFixed(0)}% → ${(100 * g(b, bt, r, 'parse_ms') / g(b, bt, r, 'p50_total')).toFixed(0)}% |`);
}
P(`\n- абсолют batch=500 R=1, мс: mono-llm ${g('mono-llm', 500, 1, 'p50_total')} · guard-llm ${g('guard-llm', 500, 1, 'p50_total')}\n`);

// http
P('## HTTP (autocannon -c 50 -d 20, batch 1000, R=5)');
const h = Object.fromEntries(jl('http.jsonl').map(r => [r.variant, r]));
for (const v of Object.keys(h)) P(`- ${v}: **${Math.round(h[v].rps_avg)} rps** · p50 ${h[v].lat_p50_ms} мс · p99 ${h[v].lat_p99_ms} мс · errors ${h[v].errors}`);
if (h['mono-llm'] && h['guard-llm']) P(`- mono/guard **${x(h['mono-llm'].rps_avg, h['guard-llm'].rps_avg)}** · p99 +${(100 * (h['guard-llm'].lat_p99_ms / h['mono-llm'].lat_p99_ms - 1)).toFixed(0)}% · mixed к mono ${(100 * (h['mixed-mono'].rps_avg / h['mono-llm'].rps_avg - 1)).toFixed(0)}%`);
P('');

// мифы
P('## Мифы (медианы 5 повторов), мс');
const my = {}; jl('myths-raw.jsonl').forEach(r => { const d = r.data; if (d && d.ms != null) (my[d.bench + '/' + d.case] ||= []).push(d.ms); });
const mm = k => med(my[k] || []);
Object.keys(my).sort().forEach(k => P(`- ${k}: ${mm(k)} (${rng(my[k])})`));
P(`\n- IC 8 форм / 1: **${x(mm('ic/8-shapes'), mm('ic/1-shapes'))}** · 4 формы / 1: ${x(mm('ic/4-shapes'), mm('ic/1-shapes'))}`);
P(`- delete / fast: **${x(mm('delete/delete'), mm('delete/fast'), 1)}** · undefined / fast: ${x(mm('delete/undefined'), mm('delete/fast'))}`);
P(`- try/catch наивный: ${x(mm('trycatch/naive-try'), mm('trycatch/naive-plain'))} · изолированный: ${mm('trycatch/honest-try')} = ${mm('trycatch/honest-plain')}`);
P(`- HOLEY / SMI: ${x(mm('elements/HOLEY'), mm('elements/SMI'))} · DOUBLE / SMI: ${x(mm('elements/DOUBLE'), mm('elements/SMI'))}`);

fs.writeFileSync(path.join(dir, 'NUMBERS.md'), out.join('\n') + '\n');
console.log(out.join('\n'));
