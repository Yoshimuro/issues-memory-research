function sameBlock() { let x = 1; x = x + 1; return x; }            // no hole check expected
function varFn() { var x = 1; x = x + 1; return x; }
function closureTDZ() { const g = () => y; let y = 2; return g(); }  // y read in closure: hole check
function blockCapture() { let fs = []; { let z = 3; fs.push(() => z); } return fs[0](); } // CreateBlockContext
function blockNoCapture() { let s = 0; { let z = 3; s += z; } return s; } // registers only
function constCtx() { const c = 5; let m = 6; const f = () => c + m; m = 7; return f(); } // immutable vs mutable slot
sameBlock(); varFn(); closureTDZ(); blockCapture(); blockNoCapture(); constCtx();
