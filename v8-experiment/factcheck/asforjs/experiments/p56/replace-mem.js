// Memory cost of String.prototype.replace on a flat 10 MB string.
// node --expose-gc --allow-natives-syntax replace-mem.js <mode>
const MB = (x) => (x / 1048576).toFixed(1) + ' MB';
function used() { gc(); gc(); return process.memoryUsage().heapUsed; }
const big = 'a'.repeat(5e6) + 'NEEDLE' + 'b'.repeat(5e6);
big.indexOf('zzz');            // flattens the cons in place
%FlattenString(big);
const mode = process.argv[2];
let u0 = used();
let r;
if (mode === 'str') r = big.replace('NEEDLE', 'X');
if (mode === 're') r = big.replace(/NEEDLE/, 'X');
if (mode === 'reg') r = big.replace(/NEEDLE/g, 'X');
if (mode === 'all') r = big.replaceAll('NEEDLE', 'X');
if (mode === 'upper') r = big.toUpperCase();
let u1 = used();
console.log(mode.padEnd(6), 'result retained: +' + MB(u1 - u0));
%DebugPrint(r.length > 0 ? r : 0);
r.indexOf('zzz');              // forces flattening of the result
let u2 = used();
console.log(mode.padEnd(6), 'after flattening result: +' + MB(u2 - u0));
