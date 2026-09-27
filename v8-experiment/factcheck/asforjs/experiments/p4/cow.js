// COW literal: where do the JSArray and its elements live, and when are elements copied?
const log = (typeof print === 'function') ? print : console.log;
function lit() { return [1, 2, 3]; }
function litD() { return [1.5, 2.5, 3.5]; }
function litO() { return [{}, 'a']; }
const a1 = lit(), a2 = lit();
log('== a1 = [1,2,3]'); %DebugPrint(a1);
log('== a2 = [1,2,3] (second evaluation)'); %DebugPrint(a2);
a1[0] = 1; log('== a1 after a1[0]=1'); %DebugPrint(a1);
a1[1] = 5; log('== a1 after a1[1]=5'); %DebugPrint(a1);
log('== litD'); %DebugPrint(litD()); log('== litD second'); %DebugPrint(litD());
log('== litO'); %DebugPrint(litO());
log('== Array(1,2,3)'); %DebugPrint(Array(1, 2, 3));
log('== new Array(3)'); %DebugPrint(new Array(3));
