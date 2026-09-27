// Does OSR code "bail out at the end" when the function finishes? Two variants:
// plain: loop then `return s`; tail: loop then code never executed before (s * 3 + '!' etc.)
const isD8 = typeof process === 'undefined';
const log = isD8 ? print : console.log;
const variant = (isD8 ? arguments : process.argv.slice(2))[0];
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
function plain(n) { let s = 0; while (n--) s += arr.reduce((a, b) => a + b, 0); return s; }
function tail(n) { let s = 0; while (n--) s += arr.reduce((a, b) => a + b, 0); const t = s * 3; return t.toString() + '!'; }
const f = variant === 'tail' ? tail : plain;
log('result', f(3000000));
log('second call', f(10));
