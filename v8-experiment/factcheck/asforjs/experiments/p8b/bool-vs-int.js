function useBool(a, flag) { let s = 0; for (let i = 0; i < a.length; i++) if (a[i] === true) s++; return s; }
function useInt(a, flag) { let s = 0; for (let i = 0; i < a.length; i++) if (a[i] === 1) s++; return s; }
const ab = [], ai = []; for (let i = 0; i < 1000; i++) { ab.push(i % 3 === 0); ai.push(i % 3 === 0 ? 1 : 0); }
%PrepareFunctionForOptimization(useBool); %PrepareFunctionForOptimization(useInt);
useBool(ab); useInt(ai); useBool(ab); useInt(ai);
%OptimizeFunctionOnNextCall(useBool); %OptimizeFunctionOnNextCall(useInt); useBool(ab); useInt(ai);
