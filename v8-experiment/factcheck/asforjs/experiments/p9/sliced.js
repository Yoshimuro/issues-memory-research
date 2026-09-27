let base = 'abcdefghijklmnopqrstuvwxyz'.repeat(4) + String(Math.random());
base = %FlattenString(base);
for (const n of [12, 13]) { const s = base.substring(1, 1 + n); print('== substring length ' + n); %DebugPrint(s); }
const r = String(Math.random()).slice(0, 6);
print('== concat 12'); %DebugPrint(r + 'abcdef');
print('== concat 13'); %DebugPrint(r + 'abcdefg');
