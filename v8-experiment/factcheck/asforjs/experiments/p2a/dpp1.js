function doScope(a) { let x = a + 1; var y = 2; return x * y }
doScope(1);
%DebugPrint(doScope);
