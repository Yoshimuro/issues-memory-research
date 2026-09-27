// Line 138 ("плоское повторение операций ... доходит только до Sparkplug"): huge function body (>60 KB bytecode) never optimizes
const log = typeof print === 'function' ? print : console.log;
const isD8 = typeof process === 'undefined';
const B = isD8 ? { baseline: 1 << 14, maglev: 1 << 4, turbofan: 1 << 5 } : { baseline: 1 << 15, maglev: 1 << 5, turbofan: 1 << 6 };
function make(nStmts) {
  let body = 'let s = 0;\n';
  for (let i = 0; i < nStmts; i++) body += `s = (s + (x ^ ${i})) | 0;\n`;
  return new Function('x', body + 'return s;');
}
for (const n of [500, 12000]) {
  const f = make(n);
  let r = 0; for (let i = 0; i < 3000; i++) r += f(i);
  const st = %GetOptimizationStatus(f);
  log(`stmts=${n} status=${st.toString(2)} ` + Object.keys(B).filter(k => st & B[k]).join(','));
}
