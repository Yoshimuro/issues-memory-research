// When does an object go to dictionary mode? named stores (o.pN = v) vs keyed stores (o[k] = v)
const log = typeof console !== 'undefined' ? console.log : print;
function firstSlow(kind) {
  const o = {};
  for (let i = 0; i < 1100; i++) {
    if (kind === 'named') { new Function('o', 'o.p' + i + ' = ' + i)(o); }
    else { o['k' + i] = i; }
    if (!%HasFastProperties(o)) return i + 1;
  }
  return 'still fast at 1100';
}
log('named store: dictionary after property #', firstSlow('named'));
log('keyed store: dictionary after property #', firstSlow('keyed'));
// in-object limit via constructor with 300 this.x assignments
let body = ''; for (let i = 0; i < 300; i++) body += 'this.q' + i + '=' + i + ';';
const F = new Function(body);
const objs = []; for (let i = 0; i < 20; i++) objs.push(new F());
log('constructor with 300 props: fast =', %HasFastProperties(objs[19]));
