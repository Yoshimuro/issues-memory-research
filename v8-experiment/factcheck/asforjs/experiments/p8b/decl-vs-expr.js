function outerDecl(c) { if (c) return helper(); return 0; function helper() { return 1; } }
function outerExpr(c) { if (c) { const helper = function () { return 1; }; return helper(); } return 0; }
outerDecl(false); outerExpr(false);
