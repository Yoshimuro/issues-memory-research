// Smi boundaries: each value passed directly (not via array, which would box to double)
const p = (typeof print==='function')?print:console.log;
function show(name, v){ p('== '+name); %DebugPrint(v); }
show('2**30-1', 2**30-1); show('2**30', 2**30); show('-2**30', -(2**30)); show('-2**30-1', -(2**30)-1);
show('2**31-1', 2**31-1); show('2**31', 2**31); show('-2**31', -(2**31)); show('-2**31-1', -(2**31)-1);
show('0', 0); show('-0', -0); show('0.0', 0.0); show('1.0', 1.0); show('NaN', NaN); show('Infinity', Infinity);
let x = 0x40000000; show('0x40000000|0', x|0); let y = 0x7fffffff; show('0x7fffffff|0', y|0);
let z = 0xffffffff; show('0xffffffff>>>0', z>>>0); show('0xffffffff|0', z|0); let a=3,b=4; show('3*4', a*b);
