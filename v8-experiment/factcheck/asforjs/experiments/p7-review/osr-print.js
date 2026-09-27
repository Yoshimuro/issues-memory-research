// one long-running call: OSR is the only way up
function doLoop(n) { let s = 0; for (let i = 0; i < n; i++) s = (s + (i & 7)) | 0; return s; }
const log = typeof print === 'function' ? print : console.log;
log('result', doLoop(3e8));
