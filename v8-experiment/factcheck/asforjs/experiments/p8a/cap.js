const a = []; let last = -1;
for (let i = 0; i < 3000; i++) { a.push(i); }
%DebugPrint(a);
const b = []; for (let i = 0; i < 1337; i++) b.push(i); %DebugPrint(b); b.push(1); %DebugPrint(b); b.pop(); b.pop(); %DebugPrint(b);
