// shapes differ AND x lives at different offsets (different handlers)
function mk(n) { const o = {}; for (let j = 0; j <= n; j++) o['s' + j] = 0; o.x = 1; return o; }
// same offset of x, different maps
function mkSame(n) { const o = {}; o['s' + n] = 0; o.x = 1; return o; }
function get4(o) { return o.x; }
function get5(o) { return o.x; }
function same5(o) { return o.x; }
%PrepareFunctionForOptimization(get4); %PrepareFunctionForOptimization(get5); %PrepareFunctionForOptimization(same5);
for (let i = 0; i < 4; i++) get4(mk(i));
for (let i = 0; i < 5; i++) get5(mk(i));
for (let i = 0; i < 5; i++) same5(mkSame(i));
print('--- 4 shapes, different offsets'); %DebugPrint(get4);
print('--- 5 shapes, different offsets'); %DebugPrint(get5);
print('--- 5 shapes, same offset'); %DebugPrint(same5);
