function mk(n, dbl) { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = dbl ? i + 0.5 : i; return a; }
function bench(a, needle, reps) { let s = 0; const t = Date.now(); for (let r = 0; r < reps; r++) s += a.indexOf(needle); return [Date.now() - t, s]; }
const n = 1 << 16, reps = 3000;
const smi = mk(n, false), dbl = mk(n, true);
for (let k = 0; k < 3; k++) {
  const a = bench(smi, -1, reps), b = bench(dbl, -1.5, reps);
  print_('smi ' + a[0] + ' ms   double ' + b[0] + ' ms   ratio smi/double ' + (a[0] / b[0]).toFixed(2));
}
function print_(s) { (typeof print === 'function' ? print : console.log)(s); }
