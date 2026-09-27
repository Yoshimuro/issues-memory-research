// capacity after one push on literals of length 4 and 3; empty array presized via length=100 vs new Array(100)
const cap = (a) => { const s = []; return a; };
const a4 = [1, 2, 3, 4]; a4.push(5); %DebugPrint(a4);
const a3 = [9, 10, 11]; a3.push(12); %DebugPrint(a3);
const e = []; e.length = 100; %DebugPrint(e);
const n = new Array(100); %DebugPrint(n);
