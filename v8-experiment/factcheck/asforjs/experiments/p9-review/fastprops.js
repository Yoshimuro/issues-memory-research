// p9-39: kMaxFastProperties=128 — does a named-store object with MUTABLE fields go to dictionary
// mode after ~128 out-of-object fields (11.3/12.4), or only at 1021 descriptors (13.6+)?
const log = typeof console !== 'undefined' ? console.log : print;
function run(mutable) {
  const o = {};
  for (let i = 0; i < 1100; i++) {
    const k = 'p' + i;
    o[k] = i;            // named (non-literal key via computed name goes through keyed store!)
    if (mutable) o[k] = i + 0.5; // reassign -> mutable/double field
    if (!%HasFastProperties(o)) return i + 1;
  }
  return 'never';
}
// keyed store (o[k]) is StoreOrigin::kMaybeKeyed; use eval-generated named stores instead
function runNamed(mutable) {
  let src = 'const o = {};';
  for (let i = 0; i < 1100; i++) {
    src += `o.p${i} = ${i};` + (mutable ? `o.p${i} = ${i}.5;` : '') + `if (!%HasFastProperties(o)) return ${i + 1};`;
  }
  src += 'return "never";';
  return new Function(src)();
}
log(version(), 'keyed const:', run(false), ' keyed mutable:', run(true), ' named const:', runNamed(false), ' named mutable:', runNamed(true));
function version() { return typeof process !== "undefined" ? "node " + process.versions.v8 : "d8 15.6"; }
