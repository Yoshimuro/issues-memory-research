// loop counter initialised with 0.0 ; count scavenges with --trace-gc
function run() { let s = 0; for (let i = 0.0; i < 2e7; i++) { s = (s + 1) | 0; } return s; }
const log = (typeof print === 'function') ? print : console.log;
const t0 = Date.now(); log('r', run(), 'ms', Date.now() - t0);
