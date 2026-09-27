// %DebugPrint of an uncalled function declaration vs after first call
function doLazy(a) { let x = a + 1; return x * 2 }
print("===== BEFORE CALL");
%DebugPrint(doLazy);
doLazy(1);
print("===== AFTER CALL");
%DebugPrint(doLazy);
