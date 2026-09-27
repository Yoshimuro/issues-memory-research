// Line 166: does V8 "give up" after several deopts? Alternate object shapes in phases; count optimizations.
const log = typeof print === 'function' ? print : console.log;
function getV(o) { return o.v; }
const shapes = [];
for (let k = 0; k < 12; k++) { const o = {}; o['p' + k] = k; o.v = k; shapes.push(o); }
let s = 0;
for (let phase = 0; phase < 12; phase++) { const o = shapes[phase]; for (let i = 0; i < 20000; i++) s += getV(o); }
log('done', s);
