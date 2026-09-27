// Cost of a worker round trip vs summing N numbers in the main thread
const { Worker } = require('worker_threads');
const src = `const { parentPort } = require('worker_threads'); parentPort.on('message', a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; parentPort.postMessage(s); });`;
function sumMain(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
(async () => {
  let t = process.hrtime.bigint();
  const w = new Worker(src, { eval: true });
  await new Promise(r => w.once('online', r));
  console.log(`worker startup: ${(Number(process.hrtime.bigint() - t) / 1e6).toFixed(2)} ms`);
  for (const n of [1e4, 1e5, 1e6]) {
    const a = Array.from({ length: n }, (_, i) => i & 1023);
    for (let k = 0; k < 3; k++) { w.postMessage(a); await new Promise(r => w.once('message', r)); sumMain(a); }
    t = process.hrtime.bigint(); for (let k = 0; k < 20; k++) { w.postMessage(a); await new Promise(r => w.once('message', r)); }
    const tw = Number(process.hrtime.bigint() - t) / 20e6;
    t = process.hrtime.bigint(); for (let k = 0; k < 20; k++) sumMain(a);
    const tm = Number(process.hrtime.bigint() - t) / 20e6;
    console.log(`n=${n}: worker round trip (clone+sum) ${tw.toFixed(3)} ms vs main-thread sum ${tm.toFixed(3)} ms`);
  }
  w.terminate();
})();
