// Is push's cost the reallocation or the push itself? push vs a[i]= append (same growth) vs prealloc a[i]=
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const N = 1e7;
function viaPush() { const a = []; for (let i = 0; i < N; i++) a.push(i); return a; }
function viaAppend() { const a = []; for (let i = 0; i < N; i++) a[i] = i; return a; }
function viaPrealloc() { const a = new Array(N); for (let i = 0; i < N; i++) a[i] = i; return a; }
viaPush(); viaAppend(); viaPrealloc();
for (let r = 0; r < 4; r++) {
  let t = now(); viaPush(); const p = now() - t;
  t = now(); viaAppend(); const ap = now() - t;
  t = now(); viaPrealloc(); const pr = now() - t;
  log(`round ${r} push=${p.toFixed(0)} append=${ap.toFixed(0)} prealloc=${pr.toFixed(0)} push/prealloc=${(p / pr).toFixed(2)} append/prealloc=${(ap / pr).toFixed(2)}`);
}
