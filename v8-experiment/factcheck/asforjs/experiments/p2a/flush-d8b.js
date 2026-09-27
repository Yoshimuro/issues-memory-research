// d8: natural (allocation-triggered) GCs over ~4 s, function not executed again
function doRare(a) { let s = 0; for (let i = 0; i < a; i++) s += i; return s }
doRare(3);
const t0 = Date.now(); let keep = [];
while (Date.now() - t0 < 4000) { for (let k = 0; k < 1e4; k++) keep.push({ k, s: 'x' + k }); if (keep.length > 3e5) keep = []; }
%DebugPrint(doRare);
