// A field that became Double does not narrow back to Smi; a local variable value returns to Smi
const o = { x: 1 }; o.x = 1.5; o.x = 1; %DebugPrint(o);
let v = 2 ** 31; v = v - 2 ** 31 + 5; %DebugPrint(v);
