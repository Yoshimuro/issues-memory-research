// replace/replaceAll with MANY matches on a flat 10 MB string.
// node --expose-gc --allow-natives-syntax replace-many.js <mode>
const MB = (x) => (x / 1048576).toFixed(1) + ' MB';
function used() { gc(); gc(); return process.memoryUsage().heapUsed; }
const big = 'abcdefghij'.repeat(1e6);   // 10 MB, 1e6 occurrences of 'e'
%FlattenString(big);
const mode = process.argv[2];
let u0 = used();
let r;
if (mode === 'reg_many') r = big.replace(/e/g, 'E');
if (mode === 'all_many') r = big.replaceAll('e', 'E');
if (mode === 'fn_many') r = big.replace(/e/g, () => 'E');
if (mode === 'split_join') r = big.split('e').join('E');
if (mode === 'one_mid') r = big.replace('e', 'E');
let u1 = used();
console.log(mode.padEnd(10), 'result retained: +' + MB(u1 - u0), 'len', r.length, 'young', %InYoungGeneration(r));
r.indexOf('zzz');   // flatten in place
let u2 = used();
console.log(mode.padEnd(10), 'after flatten:   +' + MB(u2 - u0));
