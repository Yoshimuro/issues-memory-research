// Which generation holds the literal JSArray / constructor JSArray (elements space checked separately via DebugPrintPtr in d8 debug)
const log = (typeof print === 'function') ? print : console.log;
function lit() { return [1, 2, 3]; }
const a = lit(), b = Array(1, 2, 3);
log('literal JSArray young=' + %InYoungGeneration(a) + ' | Array(1,2,3) young=' + %InYoungGeneration(b));
%DebugPrint(a);
