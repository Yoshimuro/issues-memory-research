function closureTDZ() { const g = function gInner() { return y; }; let y = 2; return g(); }
function constCtx() { const c = 5; let m = 6; const f = function fInner() { return c + m; }; m = 7; return f(); }
closureTDZ(); constCtx();
