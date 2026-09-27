// сценарий из дайджеста: doSum(1), doSum(-1), затем doSum(0.1); сумматор 0 vs -0
const print = globalThis.print || console.log;
function sumZero(x) { let sum = 0; for (let i = 0; i < 1e6; i++) sum += x; return sum; }
function sumNegZero(x) { let sum = -0; for (let i = 0; i < 1e6; i++) sum += x; return sum; }
let r = 0;
for (const f of [sumZero, sumNegZero]) { r += f(1); r += f(-1); print('--- ' + f.name + '(0.1)'); r += f(0.1); r += f(0.1); }
print('r=' + r);
