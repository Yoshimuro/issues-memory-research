// Array literal COW / spaces. d8-debug --allow-natives-syntax cow1.js
function lit() { return [1, 2, 3]; }
function litd() { return [1.5, 2.5, 3.5]; }
function lito() { return [{}, 'x']; }
print('#### literal [1,2,3] (1st exec)'); var a7 = lit(); %DebugPrint(a7);
print('#### literal [1,2,3] (2nd exec)'); var a8 = lit(); %DebugPrint(a8);
print('#### after a7[0]=1'); a7[0] = 1; %DebugPrint(a7);
print('#### new Array(3)'); var n = new Array(3); %DebugPrint(n);
print('#### double literal'); var d = litd(); %DebugPrint(d);
print('#### double literal 2nd'); var d2 = litd(); %DebugPrint(d2);
print('#### object literal elements'); var o = lito(); %DebugPrint(o);
