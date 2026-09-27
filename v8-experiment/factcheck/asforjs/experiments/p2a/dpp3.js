function doScope(a) { let x = a + 1; var y = 2; return x * y }
doScope(1);
%DebugPrint(doScope);
print("===== DebugPrintPtr(SFI address)");
if (arguments[0] !== 'skip') %DebugPrintPtr(0x09b80101da09);
