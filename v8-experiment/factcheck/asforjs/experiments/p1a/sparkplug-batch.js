// Line 113/122: when does Sparkplug actually compile? Feedback vector allocation vs. batch compilation.
const log = typeof print === 'function' ? print : console.log;
function tiny(x) { return x + 1; }
let s = 0;
for (let i = 1; i <= 300; i++) { s += tiny(i); if (i === 7 || i === 8 || i === 9 || i === 300) { log('call', i, 'status', %GetOptimizationStatus(tiny).toString(2)); } }
log(s);
