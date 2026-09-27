// --trace-elements-transitions demo: push doubles into an empty literal
function fill(n) { const arr = []; for (let i = 0; i < n; i++) arr.push(i + 0.5); return arr; }
fill(10);
const b = [1, 2, 3]; b[1] = 1.5; b[5] = 'x';
