// Summary item 5 (line 32): memory cost of eager (--no-lazy) vs lazy compilation when loading typescript.js
const before = process.memoryUsage().heapUsed;
const ts = require('/opt/node22/lib/node_modules/typescript/lib/typescript.js');
global.gc(); global.gc();
const s = require('v8').getHeapSpaceStatistics().map(x => x.space_name + '=' + (x.space_used_size / 1048576).toFixed(1)).join(' ');
console.log(process.execArgv.join(' ') || 'default', 'heapUsedMB=' + (process.memoryUsage().heapUsed / 1048576).toFixed(1), s);
