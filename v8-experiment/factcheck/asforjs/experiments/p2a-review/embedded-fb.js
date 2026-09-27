// Run: d8(debug) --allow-natives-syntax --random-seed=42 embedded-fb.js  (address below is from a previous run with the same seed)
// V8 15.6: is binary-op feedback written into the BytecodeArray before the feedback vector exists?
function doAdd(a, b) { return a + b }
doAdd(1, 2);           // one call: no feedback vector yet
%DebugPrint(doAdd);
%DebugPrintPtr(0x1fd301000109);    // the BytecodeArray (address taken from a previous run)
doAdd(1.5, 2);         // second call with a double
%DebugPrintPtr(0x1fd301000109);
