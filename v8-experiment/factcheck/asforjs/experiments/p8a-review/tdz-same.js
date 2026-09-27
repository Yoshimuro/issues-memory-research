// TDZ hole checks inside the SAME function (no closure)
function swLet(x) { switch (x) { case 0: let y = 1; return y; case 1: return y; } }
function loopLet(n) { let r = 0; for (let i = 0; i < n; i++) { if (i > 0) r += z; let z = i; } return r; }
try { swLet(0); swLet(1); } catch (e) {}
try { loopLet(1); } catch (e) {}
