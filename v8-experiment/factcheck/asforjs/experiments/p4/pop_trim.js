// pop() right-trim: capacity 100 -> pop to length 41; is the elements address kept?
const log = (typeof print === 'function') ? print : console.log;
const a = Array.from({ length: 100 }, (_, i) => i);
log('== start'); %DebugPrint(a);
while (a.length > 42) a.pop(); log('== length 42'); %DebugPrint(a);
a.pop(); log('== length 41'); %DebugPrint(a);
while (a.length > 20) a.pop(); log('== length 20'); %DebugPrint(a);
// pulsate around a capacity boundary: push past 17 then pop back
const p = []; for (let i = 0; i < 17; i++) p.push(i); log('== p 17'); %DebugPrint(p);
p.push(17); log('== p 18'); %DebugPrint(p); p.pop(); p.pop(); log('== p 16'); %DebugPrint(p); p.push(1); p.push(2); log('== p 18 again'); %DebugPrint(p);
