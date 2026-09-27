// локальный сумматор: sum = 0 vs sum = -0; сначала целые, потом дроби
const print = globalThis.print || console.log;
const ints = [], dbls = []; for (let i = 0; i < 1000; i++) { ints.push(i & 7); dbls.push((i & 7) + 0.5); }
function sumZero(a) { let sum = 0; for (let i = 0; i < a.length; i++) sum += a[i]; return sum; }
function sumNegZero(a) { let sum = -0; for (let i = 0; i < a.length; i++) sum += a[i]; return sum; }
let r = 0;
for (let k = 0; k < 3000; k++) { r += sumZero(ints); r += sumNegZero(ints); }
print('--- switching to doubles');
for (let k = 0; k < 3000; k++) { r += sumZero(dbls); r += sumNegZero(dbls); }
print('r=' + r);
