// allocation + runtime heavy: objects with changing shapes, strings, arrays
function doWork(n) { const out = []; for (let i = 0; i < n; i++) { const o = {}; o['k' + (i % 50)] = i; out.push(JSON.stringify(o)); } return out.length; }
const t0 = Date.now(); let r = 0;
for (let k = 0; k < 5; k++) r += doWork(2e5);
print('ms', Date.now() - t0, r);
