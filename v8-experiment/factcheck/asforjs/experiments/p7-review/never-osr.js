// Does %NeverOptimizeFunction also block OSR of a long loop? Status + timing.
const log = typeof print === 'function' ? print : console.log;
function doLoopN(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + (i & 7)) | 0; return s; }
function doLoopF(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + (i & 7)) | 0; return s; }
%NeverOptimizeFunction(doLoopN);
let t = Date.now(); doLoopN(1e8); const tn = Date.now() - t;
t = Date.now(); doLoopF(1e8); const tf = Date.now() - t;
log('never ms', tn, 'status', %GetOptimizationStatus(doLoopN), '| free ms', tf, 'status', %GetOptimizationStatus(doLoopF));
