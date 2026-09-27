function doConst7(){ return 7; } function doConst15(){ return 15; } function doConst3(){ return 3; }
function mk(){ return function(){ return 1; }; }
function one(fn){ return fn(); } function two(fn){ return fn(); } function sameSfi(fn){ return fn(); }
for (let i=0;i<10;i++) one(doConst7);
for (let i=0;i<10;i++) { two(doConst7); two(doConst15); }
for (let i=0;i<10;i++) sameSfi(mk());
print('### one'); %DebugPrint(one); print('### two'); %DebugPrint(two); print('### sameSfi'); %DebugPrint(sameSfi);
%PrepareFunctionForOptimization(two); two(doConst7); %OptimizeFunctionOnNextCall(two); two(doConst3);
