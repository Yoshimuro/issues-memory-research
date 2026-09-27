// Object instance sizes (are they powers of two?). d8-debug --allow-natives-syntax sizes1.js
print('#### {a,b,c}'); %DebugPrint({a: 1, b: 2, c: 3});
print('#### {a}'); %DebugPrint({a: 1});
print('#### [1,2,3]'); %DebugPrint([1, 2, 3]);
