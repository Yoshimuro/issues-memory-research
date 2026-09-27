// natural tier-up: const PI = 3.14 vs const PIf = () => 3.14
const PI = 3.14;
const PIf = () => 3.14;
function areaConst(r) { return PI * r * r; }
function areaFn(r) { return PIf() * r * r; }
let s = 0; for (let i = 0; i < 2e6; i++) { s += areaConst(i + 0.5) + areaFn(i + 0.5); }
console.log(s);
