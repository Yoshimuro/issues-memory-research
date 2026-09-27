// Does OSR code cover only the loop body, or the rest of the function after the loop too?
// After the hot loop, the function asks for its own status: kTopmostFrameIs* bits say which code runs.
const log = typeof console !== 'undefined' ? console.log : print;
function main(n) {
  let s = 0;
  for (let i = 0; i < n; i++) s = (s + i * 3) % 1000003;
  const after = %GetOptimizationStatus(main);   // executed after the loop, in the same activation
  return [s, after];
}
const [s, st] = main(5e7);
log(`s=${s} status-after-loop=${st.toString(2)}`);
log(`status-now=${%GetOptimizationStatus(main).toString(2)}`);
