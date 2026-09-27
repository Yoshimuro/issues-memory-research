// Build a large array: preallocated new Array(n) + index writes vs [] + push; SMI and double values
const log = typeof print === 'function' ? print : console.log;
const N = 1e7;
function preSmi(n) { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = i & 1023; return a; }
function pushSmi(n) { const a = []; for (let i = 0; i < n; i++) a.push(i & 1023); return a; }
function preDbl(n) { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = i + 0.5; return a; }
function pushDbl(n) { const a = []; for (let i = 0; i < n; i++) a.push(i + 0.5); return a; }
function t(f, n) { const s = Date.now(); f(n); return Date.now() - s; }
const n = (typeof process !== 'undefined' && process.argv[2]) ? +process.argv[2] : N;
for (let rep = 0; rep < 3; rep++) log(`rep${rep} n=${n}: preSmi ${t(preSmi, n)}ms | pushSmi ${t(pushSmi, n)}ms | preDbl ${t(preDbl, n)}ms | pushDbl ${t(pushDbl, n)}ms`);
