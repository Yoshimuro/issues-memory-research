// Демо 4 (раннер): запускает d8 с --log-ic (современное имя --trace-ic),
// сохраняет сырой лог и печатает строки переходов состояний IC (mono -> poly -> mega).
// Запуск: node demos/04-log-ic-run.js   (путь к d8 можно переопределить: D8_14=/path/to/d8)
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { D8_14 } from './lib/run.js';

const SCRIPT = new URL('./04-ic-shapes.js', import.meta.url).pathname;
const RESULTS = new URL('./results/', import.meta.url).pathname;
mkdirSync(RESULTS, { recursive: true });
const RAW_LOG = `${RESULTS}04-ic-v8.log`;

const version = spawnSync(D8_14, ['-e', 'print(version())'], { encoding: 'utf8' }).stdout.trim();
console.log(`d8 (V8 ${version}), скрипт: ${SCRIPT}`);
console.log(`флаг: --log-ic (в V8 >= 9.x он заменил старый --trace-ic)\n`);

const r = spawnSync(D8_14, ['--log-ic', `--logfile=${RAW_LOG}`, SCRIPT], { encoding: 'utf8' });
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(1);
}

// Формат строки: LoadIC,pc,time,line,column,old_state,new_state,map,key,modifier,slow_reason
const STATE = {
  0: 'uninitialized',
  X: 'no-feedback',
  1: 'MONOMORPHIC',
  P: 'POLYMORPHIC',
  N: 'MEGAMORPHIC',
  G: 'generic',
};

const lines = readFileSync(RAW_LOG, 'utf8')
  .split('\n')
  .filter((l) => l.startsWith('LoadIC,') && l.split(',')[8] === 'x');

let report = `IC-переходы для getX(o){return o.x} (LoadIC по ключу 'x'), V8 ${version}:\n\n`;
for (const l of lines) {
  const f = l.split(',');
  const [old, next, line] = [f[5], f[6], f[3]];
  report += `строка ${line}: ${old} (${STATE[old] ?? old}) -> ${next} (${STATE[next] ?? next})\n`;
  report += `  raw: ${l}\n`;
}
report += `\nсырой лог целиком: ${RAW_LOG}\n`;

writeFileSync(`${RESULTS}04-ic-transitions.txt`, report);
console.log(report);
