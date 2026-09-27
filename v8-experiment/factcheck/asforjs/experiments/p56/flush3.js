// Bytecode flushing with natural (non-forced) major GCs.
// node24 --trace-flush-code --trace-gc --max-old-space-size=64 flush3.js  (V8 13.6: flush after bytecode_old_age=6 major GCs)
var out = (typeof print === 'function') ? print : console.log;
function calledOnceEarly() { return 1 + 1; }
function calledEveryRound() { return 2 + 2; }
calledOnceEarly(); calledEveryRound();
var prev = null;
for (var round = 0; round < 40; round++) {
  calledEveryRound();
  var cur = [];
  for (var j = 0; j < 300000; j++) cur.push({ a: j, b: round });   // survives until next round -> promoted to old gen
  prev = cur;
}
out('done ' + prev.length);
