// Which function literals are fully parsed at load (eager) vs preparsed (lazy)?
(function doParen() { return 1 })();
!function doBang() { return 2 }();
+function doPlus() { return 3 }();
void function doVoid() { return 4 }();
var x = function doPlainExpr() { return 5 }();
function doDecl() { return 6 } doDecl();
