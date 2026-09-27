function blocks(){ { let a = 2; { let a = 3; { let a = 4; return a; } } } }
function blockCap(){ { let a = 2; return () => a; } }
blocks(); blockCap();
