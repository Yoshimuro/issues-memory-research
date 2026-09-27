const v8 = require('v8');
console.log(process.version, 'V8', process.versions.v8);
for (const s of v8.getHeapSpaceStatistics()) console.log(s.space_name.padEnd(24), 'size', (s.space_size/1048576).toFixed(2), 'MB');
// GC happens long before 4 GB: allocate short-lived garbage and count scavenges via --trace-gc
let keep = 0; for (let i = 0; i < 2e6; i++) { const o = { a: i, b: [i] }; keep += o.b.length; }
console.log('done', keep, 'heapUsed MB', (process.memoryUsage().heapUsed/1048576).toFixed(1));
