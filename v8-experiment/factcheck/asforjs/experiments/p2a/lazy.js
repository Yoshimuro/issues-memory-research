// Lazy compilation: bytecode appears only after first call
function doThing() { return 1 }
function doThing2() { return 2 }
var cond = (typeof process !== 'undefined') ? process.argv.includes('call2') : (typeof arguments !== 'undefined' && arguments[0] === 'call2');
doThing();
if (cond) doThing2();
