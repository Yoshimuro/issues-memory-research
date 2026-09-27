// Doc l.497: doGetAge in a 10,000-iteration loop -> marking/compiling/completed in --trace-opt (node20 re-check)
function Ctor(){ this.name='n'; this.age=1; }
function doGetAge(obj){ return obj.age; }
const N = +process.argv[2];
function run(){ const o = new Ctor(); let s = 0; for (let i = 0; i < N; i++) s += doGetAge(o); return s; }
console.log('N', N, run());
