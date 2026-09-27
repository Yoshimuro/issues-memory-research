// Is shrinking an array a copy? Compare the elements backing-store address before/after (d8 debug %DebugPrint)
const a = []; for (let i = 0; i < 1000; i++) a.push(i);
%DebugPrint(a);
a.length = 100;
%DebugPrint(a);
for (let i = 0; i < 60; i++) a.pop();
%DebugPrint(a);
