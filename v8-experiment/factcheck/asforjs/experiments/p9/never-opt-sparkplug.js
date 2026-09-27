// Does %NeverOptimizeFunction keep a function in the interpreter, or can Sparkplug still compile it?
const log = typeof console !== 'undefined' ? console.log : print;
function work(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + i * 3) | 0; return s; }
%NeverOptimizeFunction(work);
for (let k = 0; k < 20000; k++) work(50);
const st = %GetOptimizationStatus(work);
log('status=0x' + st.toString(16), 'neverOpt(bit1)=', !!(st & 2), 'turbofan(bit4)=', !!(st & 16), 'interpreted(bit7)=', !!(st & 128), 'baseline(bit15)=', !!(st & (1 << 15)));
