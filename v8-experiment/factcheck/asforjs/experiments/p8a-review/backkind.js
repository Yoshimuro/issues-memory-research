// Can an array's elements kind go "back up" the lattice? (full fill in V8 13.6+ replaces the map)
const log = typeof print === 'function' ? print : console.log;
function kind(a) { return (%HasSmiElements(a) ? 'SMI' : %HasDoubleElements(a) ? 'DOUBLE' : %HasObjectElements(a) ? 'ELEMENTS' : '?') + (%HasHoleyElements(a) ? '/HOLEY' : '/PACKED'); }
const a = [1, 2, 3]; a.push('x'); log('after push("x"): ' + kind(a)); a.fill(0); log('after a.fill(0): ' + kind(a));
const b = [1, 2, 3]; b.push(1.5); log('after push(1.5): ' + kind(b)); b.fill(7); log('after b.fill(7): ' + kind(b));
const c = [1, 2, 3]; c.push('x'); for (let i = 0; i < c.length; i++) c[i] = i; log('assign ints to every slot: ' + kind(c));
