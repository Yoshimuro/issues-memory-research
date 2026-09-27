// Bytecode flushing (V8 main: time based). d8 --expose-gc --trace-flush-code --bytecode-old-time=1 flush2.js
function calledOnceEarly() { return 1 + 1; }
function calledEveryRound() { return 2 + 2; }
calledOnceEarly(); calledEveryRound();
function spin(ms) { var t = Date.now(); while (Date.now() - t < ms) {} }
for (var i = 1; i <= 4; i++) { calledEveryRound(); spin(1200); gc(); print('round ' + i); }
