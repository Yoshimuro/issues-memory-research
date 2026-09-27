function defParam(x = 7){ return x / 2; }
function noDef(x){ return x / 2; }
function defCaptured(x = 7){ return () => x; }
function arrowMapA(arr){ return arr.map(x => x * 2); }
function arrowMapF(arr){ return arr.map(function (x){ return x * 2; }); }
const arrBody = (a, b) => a + b;
const fnBody = function (a, b) { return a + b; };
const curry = a => b => a + b;
function fixedArgs(a, b){ return a + b; }
function restArgs(...args){ return args[0] + args[1]; }
function useArguments(){ return arguments[0] + arguments[1]; }
function arrDestr1(arr){ const [first] = arr; return first; }
function arrDestr2(arr){ const [first, second] = arr; return first + second; }
function arrDestr5(arr){ const [a, b, c, d, e] = arr; return a + b + c + d + e; }
function objDestrNum(arr){ const {0: first, 1: second} = arr; return first + second; }
function manualIdx(arr){ const first = arr[0]; const second = arr[1]; return first + second; }
function paramPattern({name, age}){ return name + age; }
function paramPatternRen({name, age: theAge}){ return name + theAge; }
function plainAccess(obj){ return obj.name + obj.age; }
function objRest({name, ...rest}){ return rest; }
function spreadCall(f, arr){ return f(...arr); }
function mathMaxSpread(arr){ return Math.max(...arr); }
function arrSpread1(a){ return [...a]; }
function arrSpread3(a, b, c){ return [...a, ...b, c]; }
readme = 0;
const xs = [1,2,3,4,5];
defParam(); noDef(1); defCaptured()(); arrowMapA(xs); arrowMapF(xs); arrBody(1,2); fnBody(1,2); curry(1)(2); fixedArgs(1,2); restArgs(1,2); useArguments(1,2);
arrDestr1(xs); arrDestr2(xs); arrDestr5(xs); objDestrNum(xs); manualIdx(xs); paramPattern({name:'a',age:1}); paramPatternRen({name:'a',age:1}); plainAccess({name:'a',age:1}); objRest({name:'a',age:1});
spreadCall((a,b)=>a+b, xs); mathMaxSpread(xs); arrSpread1(xs); arrSpread3(xs, xs, 1);
console.log('restLen', restArgs.length, ((...a)=>0).length, ((a, ...b)=>0).length);
