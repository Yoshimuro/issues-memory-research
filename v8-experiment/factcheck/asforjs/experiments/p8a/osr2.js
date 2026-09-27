// Is the OSR slowdown about inlining or about the accumulator living in an outer context slot?
const v = process.argv[2]; const N = 1e8;
function helperTop(x) { return (x * 3 + 1) & 1023; }
let t = Date.now(), s = 0;
if (v === 'D-ctx') { (function () { for (let i = 0; i < N; i++) s += (i * 3 + 1) & 1023; })(); }             // outer accumulator, no call
else if (v === 'D-local') { (function () { let r = 0; for (let i = 0; i < N; i++) r += (i * 3 + 1) & 1023; s = r; })(); } // local accumulator, no call
else if (v === 'A-local') { (function () { let r = 0; for (let i = 0; i < N; i++) r += helperTop(i); s = r; })(); } // helper from module scope, local acc
else if (v === 'A-ctx-smi') { (function () { for (let i = 0; i < N; i++) s = (s + helperTop(i)) & 0xFFFFF; })(); } // outer acc but stays Smi
console.log(`${v}: ${Date.now() - t} ms s=${s}`);
