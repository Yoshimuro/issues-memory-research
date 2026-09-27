// Does %NeverOptimizeFunction keep the function in pure Ignition, or does Sparkplug still compile it?
const print = typeof console !== 'undefined' ? console.log : globalThis.print;
function hot(n){ let s = 0; for (let i = 0; i < n; i++) s += i; return s; }
%NeverOptimizeFunction(hot);
for (let k = 0; k < 2000; k++) hot(1000);
const st = %GetOptimizationStatus(hot);
// bit 15 = baseline (Sparkplug) in 11.3..13.6; bit 4 = optimized; bit 7 interpreted
print('status', st.toString(2), 'baseline(bit15)=', !!(st & (1<<15)), 'optimized(bit4)=', !!(st & 16), 'interpreted(bit7)=', !!(st & 128), 'turbofanned(bit5)=', !!(st&32), 'maglev(bit6)', !!(st&64));
