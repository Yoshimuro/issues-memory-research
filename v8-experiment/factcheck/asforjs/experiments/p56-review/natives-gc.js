// GC on demand through natives syntax (no --expose-gc): %CollectGarbage(0)
const out = (typeof print === 'function') ? print : console.log;
out('typeof gc = ' + typeof gc);
%CollectGarbage(0);
out('after %CollectGarbage');
