// Does a double that already exists as a HeapNumber turn a double array into references?
function mk(h) { return [h, 1.1, 2.2]; }          // literal with a HeapNumber variable inside
const h = Math.random() + 0.5;                      // a HeapNumber in the interpreter
%DebugPrint(mk(h));
const a = [1.1, 2.2]; a[1] = h; %DebugPrint(a);    // keyed store of a HeapNumber
const b = [1, 2, 3]; b[0] = h; %DebugPrint(b);     // SMI array + HeapNumber
const o = { v: 1.5 }; const c = [0.5, 0.25]; c.push(o.v); %DebugPrint(c); // value taken from a (boxed) Double field
