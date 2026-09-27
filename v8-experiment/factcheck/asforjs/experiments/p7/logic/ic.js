var g = 0;
function doOuter(o) { g = g + o.x; return g; }
for (let i = 0; i < 100; i++) doOuter({ x: i });
doOuter({ y: 1, x: 2 });
const arr = [1, 2, 3]; arr.push(1.5); arr.push('s');
