// OSR-"баг" из 8.5: doMain вызывается один раз, в while(n--) крутит arr.reduce(cb,0)
const print = globalThis.print || console.log;
const variant = (globalThis.arguments && globalThis.arguments[0]) || (typeof process !== 'undefined' && process.argv[2]);
const N = +((globalThis.arguments && globalThis.arguments[1]) || (typeof process !== 'undefined' && process.argv[3]) || 3e6);
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
function doOuter(acc, x) { return (acc + x) & 0xffff; }
const doOuterConst = (acc, x) => (acc + x) & 0xffff;
function doMain(n) {
  let s = 0;
  function doInner(acc, x) { return (acc + x) & 0xffff; }
  if (variant === 'literal') { while (n--) s = (s + arr.reduce((acc, x) => (acc + x) & 0xffff, 0)) & 0xffff; }
  else if (variant === 'inner') { while (n--) s = (s + arr.reduce(doInner, 0)) & 0xffff; }
  else if (variant === 'globalFn') { while (n--) s = (s + arr.reduce(doOuter, 0)) & 0xffff; }
  else if (variant === 'globalConst') { while (n--) s = (s + arr.reduce(doOuterConst, 0)) & 0xffff; }
  return s;
}
const t = Date.now(); const r = doMain(N); print(variant + ' time=' + (Date.now() - t) + 'ms r=' + r);
