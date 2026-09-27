// Doc 331: "Если let объявлен в том же блоке, где используется, проверки нет — код как у var". Captured let read by its own function.
function capSame(){ let x = 1; const g = () => x; return x + 1 + (g ? 0 : 1); }
function capInnerBlock(){ let x = 1; const g = () => x; { if (g) { return x + 1; } } return 0; }
function capVar(){ var x = 1; const g = () => x; return x + 1 + (g ? 0 : 1); }
capSame(); capInnerBlock(); capVar();
