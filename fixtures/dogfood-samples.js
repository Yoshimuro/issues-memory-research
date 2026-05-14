async function unreadFetch() {
  const r = await fetch('https://example.com');
  if (!r.ok) return;
}

function textDecoderInLoop(chunks) {
  for (const chunk of chunks) {
    new TextDecoder().decode(chunk);
  }
}

import { Readable } from 'node:stream';

function badToWeb(stream) {
  return Readable.toWeb(stream);
}

function badPipe() {
  const src = createReadStream('/tmp/x');
  src.pipe(createWriteStream('/tmp/y'));
}

async function goodFetch() {
  const r = await fetch('https://example.com');
  await r.json();
}

function goodToWeb(stream) {
  return Readable.toWeb(stream, {
    strategy: new ByteLengthQueuingStrategy({ highWaterMark: 16384 }),
  });
}
