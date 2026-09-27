// результаты битовых операций: Smi или HeapNumber (без массива, чтобы не было PACKED_DOUBLE)
const print = globalThis.print || console.log;
function show(label, v) { print(label.padEnd(26) + String(v).padStart(12) + ' IsSmi=' + %IsSmi(v)); }
let x = 3;
show('(1<<29)', (x << 28) | 0);
show('(1<<30)-1', ((x - 2) << 30) - 1 | 0);
show('1<<30', (x - 2) << 30);
show('0x7fffffff|0', 0x7fffffff | (x - 3));
show('-(1<<30)', -((x - 2) << 30) | 0);
show('-(1<<30)-1', (-((x - 2) << 30) - 1) | 0);
show('0xdeadbeef|0', 0xdeadbeef | (x - 3));
show('0xffffffff>>>0', (0xffffffff | 0) >>> (x - 3));
