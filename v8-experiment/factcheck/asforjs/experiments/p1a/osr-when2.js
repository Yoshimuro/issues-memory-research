const isD8 = typeof process === 'undefined';
const log = isD8 ? print : console.log;
const TF = isD8 ? 1 << 11 : 1 << 12, MG = isD8 ? 1 << 18 : 1 << 19;
function once(n) {
  let s = 0, firstMg = 0, firstTf = 0;
  for (let i = 0; i < n; i++) {
    s = (s + (i & 7)) | 0; s = (s ^ (i * 3)) | 0; s = (s + (i >> 2)) | 0; s = (s - (i & 5)) | 0; s = (s ^ (i << 1)) | 0;
    s = (s + (i & 7)) | 0; s = (s ^ (i * 3)) | 0; s = (s + (i >> 2)) | 0; s = (s - (i & 5)) | 0; s = (s ^ (i << 1)) | 0;
    const st = %GetOptimizationStatus(once);
    if (!firstMg && (st & MG)) firstMg = i;
    if (!firstTf && (st & TF)) { firstTf = i; break; }
  }
  return `firstMaglevIter=${firstMg} firstTurbofanIter=${firstTf}`;
}
log('bigger body:', once(1e7));
