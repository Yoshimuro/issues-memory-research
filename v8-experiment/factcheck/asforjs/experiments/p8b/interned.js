const o = {}; o.length = 1; o.prototype = 2; o.myUniqueKeyXyz = 3;
for (const k of Object.keys(o)) { print('--- key ' + k); %DebugPrint(k); }
