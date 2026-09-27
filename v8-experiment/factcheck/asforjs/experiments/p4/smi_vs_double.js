// "double array faster than SMI array?" push-fill + indexOf, preallocated fill + indexOf, and plain sum; same process, 3 rounds
const log = (typeof print === 'function') ? print : console.log;
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const N = 1e6;
function fillPushSmi() { const a = []; for (let i = 0; i < N; i++) a.push(i); return a; }
function fillPushDbl() { const a = []; for (let i = 0; i < N; i++) a.push(i + 0.5); return a; }
function fillPreSmi() { const a = new Array(N); for (let i = 0; i < N; i++) a[i] = i; return a; }
function fillPreDbl() { const a = new Array(N); for (let i = 0; i < N; i++) a[i] = i + 0.5; return a; }
function searchAll(a, off) { let s = 0; for (let k = 0; k < 20; k++) s += a.indexOf(N - 1 - k + off); return s; }
function sum(a) { let s = 0; for (let r = 0; r < 20; r++) for (let i = 0; i < a.length; i++) s += a[i]; return s; }
function time(f) { const t0 = now(); f(); return now() - t0; }
const res = [];
for (let round = 0; round < 4; round++) {
  let aS, aD, pS, pD;
  const r = {
    pushSmi: time(() => aS = fillPushSmi()), pushDbl: time(() => aD = fillPushDbl()),
    preSmi: time(() => pS = fillPreSmi()), preDbl: time(() => pD = fillPreDbl()),
    idxSmi: time(() => searchAll(aS, 0)), idxDbl: time(() => searchAll(aD, 0.5)),
    idxPreSmi: time(() => searchAll(pS, 0)), idxPreDbl: time(() => searchAll(pD, 0.5)),
    sumSmi: time(() => sum(aS)), sumDbl: time(() => sum(aD)) };
  if (round > 0) log('round ' + round + ': ' + Object.entries(r).map(([k, v]) => k + '=' + v.toFixed(1)).join(' ') +
     ' | idx dbl/smi=' + (r.idxDbl / r.idxSmi).toFixed(2) + ' sum dbl/smi=' + (r.sumDbl / r.sumSmi).toFixed(2) + ' push dbl/smi=' + (r.pushDbl / r.pushSmi).toFixed(2));
}
