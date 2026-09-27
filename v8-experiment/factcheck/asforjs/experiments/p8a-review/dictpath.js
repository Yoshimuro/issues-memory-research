// How many deopts does an object pay on its way to dictionary mode (keyed adds of new string keys)?
const log = typeof print === 'function' ? print : console.log;
function put(o, k, v) { o[k] = v; }
function get(o) { return o.k5; }
let total = 0;
for (let round = 0; round < 200; round++) {
  const o = {};
  for (let i = 0; i < 100; i++) put(o, 'k' + i, i);
  for (let j = 0; j < 100; j++) total += get(o);
}
const o = {}; for (let i = 0; i < 100; i++) put(o, 'k' + i, i);
log('final object fast props:', %HasFastProperties(o), 'total', total);
// Map for comparison
function mput(m, k, v) { m.set(k, v); }
function mget(m) { return m.get('k5'); }
for (let round = 0; round < 200; round++) { const m = new Map(); for (let i = 0; i < 100; i++) mput(m, 'k' + i, i); for (let j = 0; j < 100; j++) total += mget(m); }
// mixed key types into the same Map call sites
for (let round = 0; round < 200; round++) { const m = new Map(); for (let i = 0; i < 100; i++) mput(m, (i & 1) ? i : ('s' + i), i); mput(m, 1.5, 0); mput(m, {}, 0); }
log('done');
