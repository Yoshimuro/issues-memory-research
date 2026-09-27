// string representations after slice / replace / += / two-byte concat
function kind(s) { const d = %DebugPrint(s); }
const base = 'abcdefghijklmnopqrstuvwxyz0123456789'.repeat(3); // one-byte, flat
const flat = %FlattenString(base);
print('--- slice len 20'); %DebugPrint(flat.slice(1, 21));
print('--- slice len 12'); %DebugPrint(flat.slice(1, 13));
print('--- slice len 13'); %DebugPrint(flat.slice(1, 14));
print('--- replace (string pattern)'); %DebugPrint(flat.replace('klm', 'XYZ'));
print('--- replace (regexp /g)'); %DebugPrint(flat.replace(/k/g, 'Q'));
let acc = ''; for (let i = 0; i < 10; i++) acc += 'item' + i + ';';
print('--- += loop'); %DebugPrint(acc);
const tb = acc + 'Ж';
print('--- one-byte cons + two-byte char'); %DebugPrint(tb);
print('--- flattened'); %DebugPrint(%FlattenString(tb));
print('--- short concat one-byte + two-byte'); %DebugPrint('abc' + 'Ж');
