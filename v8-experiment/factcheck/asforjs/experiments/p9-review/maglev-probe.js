function f(){return 1} %PrepareFunctionForOptimization(f); f(); %OptimizeMaglevOnNextCall(f); f(); console.log(%GetOptimizationStatus(f).toString(2))
