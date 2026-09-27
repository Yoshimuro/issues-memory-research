function doForOf(a) { let s = 0; for (const x of a) s += x; return s; }
function doIndex(a) { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function doDestr(a) { const [x, y] = a; return x + y; }
doForOf([1,2]); doIndex([1,2]); doDestr([1,2]);
