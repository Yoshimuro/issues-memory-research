import { spawnSync } from 'node:child_process';
import { homedir } from 'node:os';

export const D8_14 = process.env.D8_14 ?? `${homedir()}/.jsvu/bin/v8-14.9.207`;
export const D8_LATEST = process.env.D8 ?? `${homedir()}/.jsvu/bin/v8`;

// Запускает движок и возвращает последнюю JSON-строку из stdout.
export function runJson(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} завершился с кодом ${r.status}:\n${r.stderr || r.stdout}`);
  }
  const line = r.stdout.trim().split('\n').filter((l) => l.startsWith('{')).pop();
  if (!line) throw new Error(`нет JSON в выводе: ${r.stdout}`);
  return JSON.parse(line);
}
