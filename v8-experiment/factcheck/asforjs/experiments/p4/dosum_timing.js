// Fresh-process timing: variant (zero|negzero) and N via argv / d8 arguments
const args = (typeof process !== 'undefined') ? process.argv.slice(2) : arguments;
const variant = args[0], N = +args[1];
const src = variant === 'negzero'
  ? 'function doSum(inc){ let sum = -0; for (let i = 0; i < N; i++) { sum += inc; } return sum; }'
  : 'function doSum(inc){ let sum = 0; for (let i = 0; i < N; i++) { sum += inc; } return sum; }';
const doSum = new Function('N', src + '; return doSum;')(N);
const now = (typeof performance !== 'undefined') ? () => performance.now() : () => Date.now();
const t0 = now(); let r = 0; r += doSum(1); r += doSum(-1); r += doSum(0.1);
const log = (typeof print === 'function') ? print : console.log;
log(variant + ' N=' + N + ' ms=' + (now() - t0).toFixed(2) + ' r=' + r);
