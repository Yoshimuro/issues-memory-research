// Демо 4 (ворклоад для d8): getX(o){return o.x} кормим 1 -> 2 -> 3 -> 4 -> 5 шейпами.
// IC-переходы пишутся флагом --log-ic (бывший --trace-ic) в v8.log, см. 04-log-ic-run.js.
function getX(o) {
  return o.x;
}

// 5 объектов с разными hidden classes: 'x' на разных позициях.
const shapes = [
  { x: 1 },
  { a: 1, x: 2 },
  { a: 1, b: 2, x: 3 },
  { b: 1, x: 4 },
  { c: 1, d: 2, e: 3, x: 5 },
];

let sink = 0;
for (let s = 0; s < shapes.length; s++) {
  const o = shapes[s];
  for (let i = 0; i < 400; i++) sink += getX(o);
  print(`после шейпа #${s + 1}: sink=${sink}`);
}
