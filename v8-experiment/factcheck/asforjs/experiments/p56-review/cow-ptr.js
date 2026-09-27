function lit() { return [1, 2, 3]; }
function dlit() { return [1.5, 2.5]; }
const a = lit(); const b = lit(); const d = dlit(); const d2 = dlit();
let offs = []; try { offs = read('cow-off.txt').trim().split(/\s+/).map(Number); } catch (e) {}
%DebugPrint(a); %DebugPrint(d2);
for (const o of offs) { if (o) { print('=== DebugPrintPtr ' + o.toString(16)); %DebugPrintPtr(o); } }
