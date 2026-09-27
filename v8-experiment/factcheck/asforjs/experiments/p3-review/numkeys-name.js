// Doc l.460 (reading of the streamer's experiment): obj gets 100 numeric keys obj[i]=i, then () => obj.name is optimized:
// does the access still fold into a single mov?
const obj = {name: 'x'};
for (let i = 0; i < 100; i++) obj[i] = i;
const doGetNameNum = () => obj.name;
%PrepareFunctionForOptimization(doGetNameNum); doGetNameNum(); doGetNameNum(); %OptimizeFunctionOnNextCall(doGetNameNum); doGetNameNum();
const obj2 = {name: 'y'};
for (let i = 0; i < 100; i++) obj2['p' + i] = i;
const doGetNameDict = () => obj2.name;
%PrepareFunctionForOptimization(doGetNameDict); doGetNameDict(); doGetNameDict(); %OptimizeFunctionOnNextCall(doGetNameDict); doGetNameDict();
