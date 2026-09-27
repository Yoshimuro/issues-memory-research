function kind(a) { return %DebugPrint(a); }
function Line(s) { print('\n===== ' + s); }
Line('A: field init null then number');
function PNull() { this.v = null; } const a1 = new PNull(); const a2 = new PNull(); a2.v = 1.5; %DebugPrint(a1);
Line('B: field init 0 then 1.5');
function PNum() { this.v = 0; } const b1 = new PNum(); const b2 = new PNum(); b2.v = 1.5; %DebugPrint(b1);
Line('C: defineProperty non-writable on object');
const c = { x: 1 }; Object.defineProperty(c, 'y', { value: 2, writable: false, enumerable: true, configurable: true }); print('fast props: ' + %HasFastProperties(c)); %DebugPrint(c);
Line('D: defineProperty non-writable on array index');
const d = [1, 2, 3]; Object.defineProperty(d, 1, { value: 5, writable: false }); print('dictionary elements: ' + %HasDictionaryElements(d));
Line('E: setPrototypeOf -> map');
const e1 = { x: 1 }, e2 = { x: 1 }; print('same map before: ' + %HaveSameMap(e1, e2)); Object.setPrototypeOf(e2, { z: 1 }); print('same map after: ' + %HaveSameMap(e1, e2) + ' fast: ' + %HasFastProperties(e2));
