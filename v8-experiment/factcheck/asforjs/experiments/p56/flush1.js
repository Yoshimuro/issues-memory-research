// Bytecode flushing by age. d8 --allow-natives-syntax --expose-gc --trace-flush-code flush1.js
var out = (typeof print === 'function') ? print : console.log;
function calledOnceEarly() { return 1 + 1; }
function calledEveryGC() { return 2 + 2; }
var eagerNeverCalled = (function eagerPIFE() { return function neverCalledButCompiled() { return 3; }; })();
calledOnceEarly(); calledEveryGC();
for (var i = 1; i <= 8; i++) { calledEveryGC(); gc(); out('after major GC #' + i); }
