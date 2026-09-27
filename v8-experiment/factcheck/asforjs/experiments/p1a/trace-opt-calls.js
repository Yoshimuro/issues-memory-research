// Line 136: --trace-opt for doGetAge called N times (N from argv / d8 args)
const isD8 = typeof process === 'undefined';
const log = isD8 ? print : console.log;
const N = +(isD8 ? arguments[0] : process.argv[2]);
function doGetAge(obj) { return obj.age; }
const o = { name: 'x', age: 42 };
let s = 0;
for (let i = 0; i < N; i++) s += doGetAge(o);
log('N=' + N + ' sum=' + s);
